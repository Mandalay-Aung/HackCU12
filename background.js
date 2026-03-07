// ===== Background Service Worker =====
// Monitors tabs, idle state, and unproductive sites during a focus session.

// --- Unproductive Sites Blocklist ---
const BLOCKED_DOMAINS = [
  'youtube.com', 'www.youtube.com',
  'reddit.com', 'www.reddit.com',
  'twitter.com', 'www.twitter.com', 'x.com', 'www.x.com',
  'facebook.com', 'www.facebook.com',
  'instagram.com', 'www.instagram.com',
  'tiktok.com', 'www.tiktok.com',
  'twitch.tv', 'www.twitch.tv',
  'netflix.com', 'www.netflix.com',
  'discord.com', 'www.discord.com',
  'snapchat.com', 'www.snapchat.com',
  'pinterest.com', 'www.pinterest.com',
  'tumblr.com', 'www.tumblr.com',
  'disneyplus.com', 'www.disneyplus.com',
  'hulu.com', 'www.hulu.com',
  'store.steampowered.com',
  'miniclip.com', 'www.miniclip.com',
  'poki.com', 'www.poki.com',
  'crazygames.com', 'www.crazygames.com'
];

// --- Thresholds (in milliseconds) ---
const SAME_TAB_THRESHOLD = 30 * 60 * 1000;   // 30 minutes on same tab
const IDLE_THRESHOLD = 3 * 60 * 1000;          // 3 minutes no activity
const CHECK_INTERVAL = 15 * 1000;              // check every 15 seconds

// --- Notification Helpers ---
function notify(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message,
    priority: 2
  });
}

function isBlocked(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return BLOCKED_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

// --- Session Helpers ---
async function getSession() {
  return new Promise(resolve => {
    chrome.storage.local.get(['focusSession'], (result) => {
      resolve(result.focusSession || { active: false });
    });
  });
}

async function updateSession(updates) {
  const session = await getSession();
  if (!session.active) return;
  const updated = { ...session, ...updates };
  return new Promise(resolve => {
    chrome.storage.local.set({ focusSession: updated }, resolve);
  });
}

// --- Tab Change Detection ---
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const session = await getSession();
  if (!session.active) return;

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const url = tab.url || '';

    // Check if the new tab is an unproductive site
    if (isBlocked(url)) {
      const count = (session.blockedVisits || 0) + 1;
      await updateSession({ blockedVisits: count, alertsCount: (session.alertsCount || 0) + 1 });
      notify(
        '⚠️ Distraction Detected!',
        `You're on ${new URL(url).hostname} — get back to "${session.subject}"!`
      );
    }

    // Reset tab timer for the new tab
    await updateSession({ lastTabUrl: url, lastTabTime: Date.now() });
  } catch (e) {
    // Tab might have been closed
  }
});

// --- URL Change Detection (same tab, navigated to new URL) ---
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const session = await getSession();
    if (!session.active) return;

    if (isBlocked(changeInfo.url)) {
      const count = (session.blockedVisits || 0) + 1;
      await updateSession({ blockedVisits: count, alertsCount: (session.alertsCount || 0) + 1 });
      notify(
        '⚠️ Distraction Detected!',
        `You navigated to ${new URL(changeInfo.url).hostname} — stay focused on "${session.subject}"!`
      );
    }

    // Reset tab timer
    await updateSession({ lastTabUrl: changeInfo.url, lastTabTime: Date.now() });
  }
});

// --- Activity Reports from Content Script ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ACTIVITY_PING') {
    updateSession({ lastActivity: Date.now() });
  }
  if (message.type === 'SESSION_START' || message.type === 'SESSION_STOP') {
    // Acknowledged — no extra action needed
  }
});

// --- Periodic Checks (idle + same-tab-too-long) ---
setInterval(async () => {
  const session = await getSession();
  if (!session.active) return;

  const now = Date.now();

  // Check idle
  const lastActivity = session.lastActivity || now;
  if (now - lastActivity > IDLE_THRESHOLD) {
    const count = (session.idleCount || 0) + 1;
    await updateSession({ idleCount: count, alertsCount: (session.alertsCount || 0) + 1 });
    notify(
      '💤 Are you still there?',
      `No activity detected for a while. Time to get back to "${session.subject}"!`
    );
    // Reset to avoid spamming — next alert after another full idle period
    await updateSession({ lastActivity: now });
  }

  // Check same tab too long
  const tabTime = session.lastTabTime || now;
  if (now - tabTime > SAME_TAB_THRESHOLD) {
    await updateSession({
      alertsCount: (session.alertsCount || 0) + 1,
      lastTabTime: now  // reset so we don't spam
    });
    notify(
      '🔄 Stuck on the same page?',
      `You've been on the same tab for over 30 minutes. Still working on "${session.subject}"?`
    );
  }
}, CHECK_INTERVAL);

// --- Chrome Idle API (system-level idle/locked) ---
chrome.idle.setDetectionInterval(180); // 3 minutes

chrome.idle.onStateChanged.addListener(async (newState) => {
  const session = await getSession();
  if (!session.active) return;

  if (newState === 'idle' || newState === 'locked') {
    const count = (session.idleCount || 0) + 1;
    await updateSession({ idleCount: count, alertsCount: (session.alertsCount || 0) + 1 });
    notify(
      '💤 You seem away!',
      `Chrome detected you're ${newState}. Come back and focus on "${session.subject}"!`
    );
  }

  if (newState === 'active') {
    await updateSession({ lastActivity: Date.now() });
  }
});
