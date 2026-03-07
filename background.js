// ===== BuffaloFocus Background Service Worker =====

// --- Default Configuration ---
const DEFAULT_CONFIG = {
  sameTabTimeout: 30,       // minutes before "same tab too long" alert
  idleTimeout: 5,           // minutes of no activity before alert
  alarmSoundEnabled: true,  // play alarm sounds with notifications
  focusSubject: '',
  sessionStartTime: null,
  isSessionActive: false,
  unproductiveSites: [
    'youtube.com', 'reddit.com', 'twitter.com', 'x.com',
    'facebook.com', 'instagram.com', 'tiktok.com', 'twitch.tv',
    'netflix.com', 'hulu.com', 'disneyplus.com',
    'discord.com', 'snapchat.com', 'pinterest.com',
    'tumblr.com', 'buzzfeed.com', '9gag.com',
    'miniclip.com', 'poki.com', 'crazygames.com',
    'addictinggames.com', 'kongregate.com', 'newgrounds.com',
    'store.steampowered.com', 'twitch.tv'
  ]
};

// --- State ---
let currentTabId = null;
let currentTabUrl = '';
let tabStartTime = Date.now();
let lastActivityTime = Date.now();
let focusSubject = '';
let isSessionActive = false;


// --- Initialization ---/
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['config'], (result) => {
    if (!result.config) {
      chrome.storage.local.set({ config: DEFAULT_CONFIG });
    }
  });

  // Set up idle detection (reports after 60 seconds of system idle)
  chrome.idle.setDetectionInterval(60);

  // Create check alarm - fires every minute
  chrome.alarms.create('productivityCheck', { periodInMinutes: 1 });
});

// --- Alarm Handler (runs every minute) ---
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'productivityCheck') {
    checkProductivity();
  }
});

// --- Tab Change Tracking ---
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    handleTabChange(tab.id, tab.url || '');
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tabId === currentTabId) {
    handleTabChange(tabId, changeInfo.url);
  }
});

function handleTabChange(tabId, url) {
  const oldUrl = currentTabUrl;
  currentTabId = tabId;
  currentTabUrl = url;
  tabStartTime = Date.now();

  // Check if new site is unproductive
  checkIfUnproductive(url);
}

// --- Check if URL is unproductive ---
function checkIfUnproductive(url) {
  if (!url || !isSessionActive) return;

  chrome.storage.local.get(['config'], (result) => {
    const config = result.config || DEFAULT_CONFIG;
    const unproductiveSites = config.unproductiveSites || DEFAULT_CONFIG.unproductiveSites;

    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      const isUnproductive = unproductiveSites.some(site => hostname.includes(site));

      if (isUnproductive) {
        sendNotification(
          '🦬 Hey, get back to work!',
          `You should be studying ${focusSubject}! This site isn't helping you focus.`,
          'unproductive_site',
          'horn'
        );
      }
    } catch (e) {
      // Invalid URL, ignore
    }
  });
}

// --- Productivity Check (runs every minute) ---
function checkProductivity() {
  if (!isSessionActive) return;

  chrome.storage.local.get(['config'], (result) => {
    const config = result.config || DEFAULT_CONFIG;
    const now = Date.now();

    // Check same tab timeout
    const tabMinutes = (now - tabStartTime) / (1000 * 60);
    if (tabMinutes >= config.sameTabTimeout) {
      sendNotification(
        '🦬 You\'ve been on this tab a while...',
        `You've been on the same tab for ${Math.floor(tabMinutes)} minutes. Still working on ${focusSubject}?`,
        'same_tab',
        'chime'
      );
      // Reset so we don't spam
      tabStartTime = now;
    }

    // Check idle timeout
    const idleMinutes = (now - lastActivityTime) / (1000 * 60);
    if (idleMinutes >= config.idleTimeout) {
      sendNotification(
        '🦬 Are you still there?',
        `No activity for ${Math.floor(idleMinutes)} minutes. Are you doomscrolling? Get back to ${focusSubject}!`,
        'idle',
        'urgent'
      );
      // Reset so we don't spam
      lastActivityTime = now;
    }
  });
}

// --- System Idle Detection ---
chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'active') {
    lastActivityTime = Date.now();
  }
});

// --- Activity Messages from Content Script ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'activity') {
    lastActivityTime = Date.now();
    sendResponse({ status: 'ok' });
  }

  if (message.type === 'startSession') {
    focusSubject = message.subject;
    isSessionActive = true;
    tabStartTime = Date.now();
    lastActivityTime = Date.now();

    chrome.storage.local.set({
      session: {
        subject: focusSubject,
        startTime: Date.now(),
        isActive: true
      }
    });

    sendResponse({ status: 'started' });
  }

  if (message.type === 'stopSession') {
    isSessionActive = false;
    focusSubject = '';

    chrome.storage.local.set({
      session: {
        subject: '',
        startTime: null,
        isActive: false
      }
    });

    sendResponse({ status: 'stopped' });
  }

  if (message.type === 'testAlarm') {
    playAlarmSound(message.sound);
    sendResponse({ status: 'playing' });
  }

  if (message.type === 'getStatus') {
    sendResponse({
      isActive: isSessionActive,
      subject: focusSubject,
      tabTime: Math.floor((Date.now() - tabStartTime) / 1000),
      idleTime: Math.floor((Date.now() - lastActivityTime) / 1000)
    });
  }

  return true; // Keep message channel open for async response
});

// --- Notification Helper ---
function sendNotification(title, message, tag, alarmSound) {
  chrome.notifications.create(tag + '_' + Date.now(), {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message,
    priority: 2
  });

  // Play alarm sound if enabled
  if (alarmSound) {
    chrome.storage.local.get(['config'], (result) => {
      const config = result.config || DEFAULT_CONFIG;
      if (config.alarmSoundEnabled !== false) {
        playAlarmSound(alarmSound);
      }
    });
  }
}

// --- Offscreen Document for Audio ---
let creatingOffscreen = false;

async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) return;

  if (creatingOffscreen) return;
  creatingOffscreen = true;

  try {
    await chrome.offscreen.createDocument({
      url: 'alarm.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Playing alarm sounds for productivity notifications'
    });
  } catch (e) {
    // Document may already exist
  }
  creatingOffscreen = false;
}

async function playAlarmSound(sound) {
  await ensureOffscreenDocument();
  chrome.runtime.sendMessage({ type: 'playAlarm', sound });
}

// --- Restore session on startup ---
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['session'], (result) => {
    if (result.session && result.session.isActive) {
      isSessionActive = true;
      focusSubject = result.session.subject;
      tabStartTime = Date.now();
      lastActivityTime = Date.now();
    }
  });

  chrome.idle.setDetectionInterval(60);
  chrome.alarms.create('productivityCheck', { periodInMinutes: 1 });
});
