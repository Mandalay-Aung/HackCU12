// BuffFocus Content Script
// Tracks keyboard and mouse activity on web pages

let lastReport = 0;
const REPORT_INTERVAL = 10000; // Report activity every 10 seconds max

function reportActivity() {
  const now = Date.now();
  if (now - lastReport < REPORT_INTERVAL) return;
  lastReport = now;

  try {
    chrome.runtime.sendMessage({ type: 'activity' }, (response) => {
      if (chrome.runtime.lastError) {
        // Extension context invalidated, ignore
      }
    });
  } catch (e) {
    // Extension not available
  }
}

// Track mouse movement
document.addEventListener('mousemove', reportActivity, { passive: true });

// Track mouse clicks
document.addEventListener('click', reportActivity, { passive: true });

// Track keyboard input
document.addEventListener('keydown', reportActivity, { passive: true });

// Track scroll
document.addEventListener('scroll', reportActivity, { passive: true });

// Track touch events for mobile
document.addEventListener('touchstart', reportActivity, { passive: true });
