// ===== Content Script =====
// Injected into every page to detect user activity and display distraction alerts.

// ---- Activity Tracking ----
let lastReport = 0;
const THROTTLE_MS = 10000;

function reportActivity() {
  const now = Date.now();
  if (now - lastReport < THROTTLE_MS) return;
  lastReport = now;
  try {
    chrome.runtime.sendMessage({ type: 'ACTIVITY_PING' });
  } catch (e) { /* extension context invalidated */ }
}

document.addEventListener('mousemove', reportActivity, { passive: true });
document.addEventListener('keydown', reportActivity, { passive: true });
document.addEventListener('click', reportActivity, { passive: true });
document.addEventListener('scroll', reportActivity, { passive: true });
document.addEventListener('touchstart', reportActivity, { passive: true });


// ---- Alert Sound (Web Audio API — no file needed) ----
function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Play 3 escalating beeps
    [0, 0.25, 0.5].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.value = 520 + (i * 180); // Rising pitch: 520, 700, 880 Hz

      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.2);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.2);
    });
  } catch (e) { /* Audio not available */ }
}


// ---- Fullscreen Distraction Overlay ----
let overlayActive = false;

function showDistractionOverlay(message, subject) {
  if (overlayActive) return;
  overlayActive = true;

  // Play alert sound
  playAlertSound();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'focusguard-overlay';
  overlay.innerHTML = `
    <div id="focusguard-overlay-content">
      <img src="${chrome.runtime.getURL('icons/distraction.png')}" id="focusguard-alert-img" alt="Alert!">
      <h1 id="focusguard-title">🚨 DISTRACTION DETECTED!</h1>
      <p id="focusguard-message">${message}</p>
      <p id="focusguard-subject">Get back to: <strong>${subject}</strong></p>
      <button id="focusguard-dismiss-btn">I'll get back to work!</button>
    </div>
  `;

  // Inject styles
  const style = document.createElement('style');
  style.id = 'focusguard-overlay-style';
  style.textContent = `
    #focusguard-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.92) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      animation: focusguard-fadein 0.3s ease !important;
      backdrop-filter: blur(8px) !important;
    }

    @keyframes focusguard-fadein {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes focusguard-shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
      20%, 40%, 60%, 80% { transform: translateX(6px); }
    }

    @keyframes focusguard-pulse-glow {
      0%, 100% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.3); }
      50% { box-shadow: 0 0 60px rgba(239, 68, 68, 0.6); }
    }

    #focusguard-overlay-content {
      text-align: center !important;
      padding: 40px !important;
      max-width: 480px !important;
      background: linear-gradient(145deg, #1a1a2e, #16213e) !important;
      border: 2px solid rgba(239, 68, 68, 0.5) !important;
      border-radius: 20px !important;
      animation: focusguard-shake 0.6s ease, focusguard-pulse-glow 2s infinite !important;
    }

    #focusguard-alert-img {
      width: 150px !important;
      height: 150px !important;
      border-radius: 16px !important;
      margin-bottom: 16px !important;
      object-fit: cover !important;
      border: 2px solid rgba(239, 68, 68, 0.4) !important;
    }

    #focusguard-title {
      font-family: 'Segoe UI', -apple-system, sans-serif !important;
      font-size: 28px !important;
      font-weight: 800 !important;
      color: #ef4444 !important;
      margin: 0 0 12px 0 !important;
      text-shadow: 0 0 20px rgba(239, 68, 68, 0.4) !important;
    }

    #focusguard-message {
      font-family: 'Segoe UI', -apple-system, sans-serif !important;
      font-size: 16px !important;
      color: #d1d5db !important;
      margin: 0 0 8px 0 !important;
      line-height: 1.5 !important;
    }

    #focusguard-subject {
      font-family: 'Segoe UI', -apple-system, sans-serif !important;
      font-size: 18px !important;
      color: #a78bfa !important;
      margin: 0 0 24px 0 !important;
    }

    #focusguard-subject strong {
      color: #c4b5fd !important;
      font-size: 20px !important;
    }

    #focusguard-dismiss-btn {
      font-family: 'Segoe UI', -apple-system, sans-serif !important;
      padding: 14px 32px !important;
      background: linear-gradient(135deg, #7c3aed, #6dd5fa) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 12px !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: transform 0.15s, box-shadow 0.2s !important;
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3) !important;
    }

    #focusguard-dismiss-btn:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5) !important;
    }
  `;

  document.documentElement.appendChild(style);
  document.documentElement.appendChild(overlay);

  // Dismiss handler
  document.getElementById('focusguard-dismiss-btn').addEventListener('click', () => {
    overlay.remove();
    style.remove();
    overlayActive = false;
  });

  // Auto-dismiss after 30 seconds
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.remove();
      style.remove();
      overlayActive = false;
    }
  }, 30000);
}


// ---- Listen for alerts from background ----
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_DISTRACTION_ALERT') {
    showDistractionOverlay(message.text, message.subject);
  }
  if (message.type === 'SHOW_IDLE_ALERT') {
    showDistractionOverlay(message.text, message.subject);
  }
  if (message.type === 'SHOW_TAB_ALERT') {
    showDistractionOverlay(message.text, message.subject);
  }
});
