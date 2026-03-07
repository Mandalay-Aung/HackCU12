// ===== Content Script =====
// Injected into every page to detect user activity (mouse, keyboard, scrolling).
// Reports activity back to the background service worker so it can track idle time.

let lastReport = 0;
const THROTTLE_MS = 10000; // Report at most every 10 seconds to avoid performance hit

function reportActivity() {
  const now = Date.now();
  if (now - lastReport < THROTTLE_MS) return;
  lastReport = now;

  try {
    chrome.runtime.sendMessage({ type: 'ACTIVITY_PING' });
  } catch (e) {
    // Extension context may have been invalidated — ignore silently
  }
}

// Listen for user interaction events
document.addEventListener('mousemove', reportActivity, { passive: true });
document.addEventListener('keydown', reportActivity, { passive: true });
document.addEventListener('click', reportActivity, { passive: true });
document.addEventListener('scroll', reportActivity, { passive: true });
document.addEventListener('touchstart', reportActivity, { passive: true });
