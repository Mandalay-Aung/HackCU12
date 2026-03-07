// ===== BuffaloFocus Popup Script =====

// --- DOM Elements ---
const startScreen = document.getElementById('startScreen');
const sessionScreen = document.getElementById('sessionScreen');
const subjectInput = document.getElementById('subjectInput');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sessionSubject = document.getElementById('sessionSubject');
const sessionTime = document.getElementById('sessionTime');
const tabTime = document.getElementById('tabTime');
const lastActivity = document.getElementById('lastActivity');
const buffaloMessage = document.getElementById('buffaloMessage');
const settingsToggle = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const sameTabTimeoutInput = document.getElementById('sameTabTimeout');
const idleTimeoutInput = document.getElementById('idleTimeout');
const mascot = document.getElementById('mascot');

// --- Motivational Messages ---
const motivationalMessages = [
  "Let's crush it! Stay focused! 💪",
  "You've got this, Buff! 🦬",
  "Ralphie believes in you! 🏆",
  "Sko Buffs! Keep pushing! 🎯",
  "Be Boulder, be focused! 🏔️",
  "Champions study hard! ⭐",
  "One chapter at a time! 📖",
  "Your future self will thank you! 🌟",
  "Buffalo strong, buffalo focused! 💛",
  "CU later, distractions! 🖐️"
];

let sessionStartTime = null;
let updateInterval = null;

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  checkSession();
  setupEventListeners();
});

// --- Event Listeners ---
function setupEventListeners() {
  // Start session
  startBtn.addEventListener('click', startSession);

  // Stop session
  stopBtn.addEventListener('click', stopSession);

  // Quick subject buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      subjectInput.value = btn.dataset.subject;
      subjectInput.focus();
    });
  });

  // Settings toggle
  settingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
    settingsToggle.classList.toggle('active');
  });

  // Save settings
  saveSettingsBtn.addEventListener('click', saveSettings);

  // Enter key to start
  subjectInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') startSession();
  });

  // Mascot interaction
  mascot.addEventListener('click', () => {
    updateBuffaloMessage();
    mascot.style.transform = 'rotate(10deg)';
    setTimeout(() => { mascot.style.transform = 'rotate(0deg)'; }, 300);
  });
}

// --- Start Focus Session ---
function startSession() {
  const subject = subjectInput.value.trim();
  if (!subject) {
    subjectInput.style.borderColor = '#e74c3c';
    subjectInput.style.animation = 'shake 0.4s ease';
    setTimeout(() => {
      subjectInput.style.borderColor = '';
      subjectInput.style.animation = '';
    }, 400);
    return;
  }

  chrome.runtime.sendMessage({ type: 'startSession', subject }, (response) => {
    if (response && response.status === 'started') {
      sessionStartTime = Date.now();
      showSessionScreen(subject);
    }
  });
}

// --- Stop Focus Session ---
function stopSession() {
  chrome.runtime.sendMessage({ type: 'stopSession' }, (response) => {
    if (response && response.status === 'stopped') {
      clearInterval(updateInterval);
      showStartScreen();
    }
  });
}

// --- Show Screens ---
function showSessionScreen(subject) {
  startScreen.classList.add('hidden');
  sessionScreen.classList.remove('hidden');
  sessionSubject.textContent = subject;
  updateBuffaloMessage();
  startUpdating();
}

function showStartScreen() {
  sessionScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  subjectInput.value = '';
}

// --- Check Existing Session ---
function checkSession() {
  chrome.runtime.sendMessage({ type: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError) return;
    if (response && response.isActive) {
      chrome.storage.local.get(['session'], (result) => {
        if (result.session) {
          sessionStartTime = result.session.startTime;
          showSessionScreen(response.subject);
        }
      });
    }
  });
}

// --- Update Stats ---
function startUpdating() {
  updateStats();
  updateInterval = setInterval(updateStats, 1000);
}

function updateStats() {
  chrome.runtime.sendMessage({ type: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError || !response) return;

    // Session time
    if (sessionStartTime) {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      sessionTime.textContent = formatTime(elapsed);
    }

    // Tab time
    tabTime.textContent = formatTime(response.tabTime);

    // Activity
    if (response.idleTime < 30) {
      lastActivity.textContent = 'Active';
      lastActivity.style.color = '#2ecc71';
    } else if (response.idleTime < 120) {
      lastActivity.textContent = formatTime(response.idleTime);
      lastActivity.style.color = '#f39c12';
    } else {
      lastActivity.textContent = formatTime(response.idleTime);
      lastActivity.style.color = '#e74c3c';
    }
  });
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// --- Buffalo Messages ---
function updateBuffaloMessage() {
  const msgText = buffaloMessage.querySelector('.message-text');
  const randomMsg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  msgText.textContent = randomMsg;
  buffaloMessage.style.animation = 'none';
  setTimeout(() => { buffaloMessage.style.animation = 'slideIn 0.5s ease-out'; }, 10);
}

// --- Settings ---
function loadSettings() {
  chrome.storage.local.get(['config'], (result) => {
    if (result.config) {
      sameTabTimeoutInput.value = result.config.sameTabTimeout || 30;
      idleTimeoutInput.value = result.config.idleTimeout || 5;
    }
  });
}

function saveSettings() {
  chrome.storage.local.get(['config'], (result) => {
    const config = result.config || {};
    config.sameTabTimeout = parseInt(sameTabTimeoutInput.value) || 30;
    config.idleTimeout = parseInt(idleTimeoutInput.value) || 5;

    chrome.storage.local.set({ config }, () => {
      saveSettingsBtn.textContent = '✅ Saved!';
      setTimeout(() => { saveSettingsBtn.textContent = 'Save Settings'; }, 1500);
    });
  });
}

// --- Shake Animation ---
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);
