// BuffFocus Popup Script

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const enterAppBtn = document.getElementById('enterAppBtn');
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
const alarmSoundToggle = document.getElementById('alarmSoundToggle');
const alarmTypeSelect = document.getElementById('alarmType');
const alarmTypeRow = document.getElementById('alarmTypeRow');
const quoteToggle = document.getElementById('quoteToggle');
const quoteIntervalInput = document.getElementById('quoteInterval');
const quoteIntervalRow = document.getElementById('quoteIntervalRow');
const testAlarmBtn = document.getElementById('testAlarmBtn');
const mascot = document.getElementById('mascot');

// Motivational Messages
const motivationalMessages = [
  "Let's crush it! Stay focused! 💪",
  "You've got this! 🦬",
  "Ralphie believes in you! 🏆",
  "Sko Buffs. Keep pushing! 🎯",
  "Be Boulder, be focused! 🏔️",
  "Champions study hard! ⭐",
  "One chapter at a time! 📖",
  "Your future self will thank you! 🌟",
  "Huff, Grunt, (Buffalo sounds)",
  "CU later, distractions! 🖐️"
];

let sessionStartTime = null;
let updateInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  checkSession();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Enter App from Welcome Screen
  enterAppBtn.addEventListener('click', () => {
    welcomeScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    // Hide header on main screens to save space or just keep it
  });

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

  // Alarm sound toggle
  alarmSoundToggle.addEventListener('change', () => {
    alarmTypeRow.style.display = alarmSoundToggle.checked ? 'flex' : 'none';
    testAlarmBtn.style.display = alarmSoundToggle.checked ? 'block' : 'none';
  });

  // Motivational Quote toggle
  quoteToggle.addEventListener('change', () => {
    quoteIntervalRow.style.display = quoteToggle.checked ? 'flex' : 'none';
  });

  // Test alarm button
  testAlarmBtn.addEventListener('click', () => {
    const soundType = alarmTypeSelect.value === 'all' ? 'chime' : alarmTypeSelect.value;
    chrome.runtime.sendMessage({ type: 'testAlarm', sound: soundType });
    testAlarmBtn.textContent = '🔊 Playing...';
    setTimeout(() => { testAlarmBtn.textContent = '🔊 Test Alarm'; }, 1500);
  });

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

// Start Focus Session
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

// Stop Focus Session
function stopSession() {
  chrome.runtime.sendMessage({ type: 'stopSession' }, (response) => {
    if (response && response.status === 'stopped') {
      clearInterval(updateInterval);
      showStartScreen();
    }
  });
}

// Show Screens
function showSessionScreen(subject) {
  welcomeScreen.classList.add('hidden');
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

// Check Existing Session
function checkSession() {
  chrome.runtime.sendMessage({ type: 'getStatus' }, (response) => {
    if (chrome.runtime.lastError) {
      // Background worker might be asleep, just show welcome screen
      welcomeScreen.classList.remove('hidden');
      return;
    }
    
    if (response && response.isActive) {
      chrome.storage.local.get(['session'], (result) => {
        if (result.session) {
          sessionStartTime = result.session.startTime;
          showSessionScreen(response.subject);
        }
      });
    } else {
      // Show welcome screen if no active session
      welcomeScreen.classList.remove('hidden');
    }
  });
}

// Update Stats
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

// Buffalo Messages
function updateBuffaloMessage() {
  const msgText = buffaloMessage.querySelector('.message-text');
  const randomMsg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  msgText.textContent = randomMsg;
  buffaloMessage.style.animation = 'none';
  setTimeout(() => { buffaloMessage.style.animation = 'slideIn 0.5s ease-out'; }, 10);
}

// Settings 
function loadSettings() {
  chrome.storage.local.get(['config'], (result) => {
    if (result.config) {
      sameTabTimeoutInput.value = result.config.sameTabTimeout || 30;
      idleTimeoutInput.value = result.config.idleTimeout || 5;
      alarmSoundToggle.checked = result.config.alarmSoundEnabled !== false;
      alarmTypeSelect.value = result.config.alarmSoundType || 'all';
      alarmTypeRow.style.display = alarmSoundToggle.checked ? 'flex' : 'none';
      testAlarmBtn.style.display = alarmSoundToggle.checked ? 'block' : 'none';
      
      quoteToggle.checked = result.config.quoteEnabled !== false;
      quoteIntervalInput.value = result.config.quoteInterval || 15;
      quoteIntervalRow.style.display = quoteToggle.checked ? 'flex' : 'none';
    }
  });
}

function saveSettings() {
  chrome.storage.local.get(['config'], (result) => {
    const config = result.config || {};
    config.sameTabTimeout = parseInt(sameTabTimeoutInput.value) || 30;
    config.idleTimeout = parseInt(idleTimeoutInput.value) || 5;
    config.alarmSoundEnabled = alarmSoundToggle.checked;
    config.alarmSoundType = alarmTypeSelect.value;
    config.quoteEnabled = quoteToggle.checked;
    config.quoteInterval = parseInt(quoteIntervalInput.value) || 15;

    chrome.storage.local.set({ config }, () => {
      saveSettingsBtn.textContent = '✅ Saved!';
      // Notify background to update intervals if needed
      chrome.runtime.sendMessage({ type: 'updateConfig', config });
      setTimeout(() => { saveSettingsBtn.textContent = 'Save Settings'; }, 1500);
    });
  });
}

// Shake Animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);
