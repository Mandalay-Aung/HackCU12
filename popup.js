// ===== Popup Script =====
// Handles UI interaction for the FocusGuard extension popup.

const setupScreen = document.getElementById('setup-screen');
const sessionScreen = document.getElementById('session-screen');
const subjectInput = document.getElementById('subject-input');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const currentSubject = document.getElementById('current-subject');
const sessionTimer = document.getElementById('session-timer');
const alertsCount = document.getElementById('alerts-count');
const blockedVisits = document.getElementById('blocked-visits');
const idleCount = document.getElementById('idle-count');
const statusIndicator = document.getElementById('status-indicator');

let timerInterval = null;

// ---- Helpers ----

function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function showScreen(screen) {
  setupScreen.classList.add('hidden');
  sessionScreen.classList.add('hidden');
  screen.classList.remove('hidden');
}

// ---- Timer ----

function startTimer(startTime) {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    sessionTimer.textContent = formatTime(elapsed);
  }, 1000);
}

// ---- Load State ----

function loadState() {
  chrome.storage.local.get(['focusSession'], (result) => {
    const session = result.focusSession;
    if (session && session.active) {
      currentSubject.textContent = `📚 ${session.subject}`;
      alertsCount.textContent = session.alertsCount || 0;
      blockedVisits.textContent = session.blockedVisits || 0;
      idleCount.textContent = session.idleCount || 0;
      startTimer(session.startTime);
      showScreen(sessionScreen);
    } else {
      showScreen(setupScreen);
    }
  });
}

// ---- Periodic Stats Refresh ----

function refreshStats() {
  chrome.storage.local.get(['focusSession'], (result) => {
    const session = result.focusSession;
    if (session && session.active) {
      alertsCount.textContent = session.alertsCount || 0;
      blockedVisits.textContent = session.blockedVisits || 0;
      idleCount.textContent = session.idleCount || 0;
    }
  });
}

setInterval(refreshStats, 2000);

// ---- Start Session ----

startBtn.addEventListener('click', () => {
  const subject = subjectInput.value.trim();
  if (!subject) {
    subjectInput.style.borderColor = '#ef4444';
    subjectInput.setAttribute('placeholder', 'Please enter a subject!');
    return;
  }

  const session = {
    active: true,
    subject: subject,
    startTime: Date.now(),
    alertsCount: 0,
    blockedVisits: 0,
    idleCount: 0,
    lastTabUrl: '',
    lastTabTime: Date.now(),
    lastActivity: Date.now()
  };

  chrome.storage.local.set({ focusSession: session }, () => {
    // Tell background to start monitoring
    chrome.runtime.sendMessage({ type: 'SESSION_START' });
    loadState();
  });
});

// ---- Stop Session ----

stopBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  chrome.storage.local.set({
    focusSession: { active: false }
  }, () => {
    chrome.runtime.sendMessage({ type: 'SESSION_STOP' });
    showScreen(setupScreen);
    subjectInput.value = '';
  });
});

// ---- Enter key to start ----

subjectInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startBtn.click();
});

// ---- Init ----
loadState();
