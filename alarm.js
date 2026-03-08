// BuffFocus Alarm Sound System
// Uses Web Audio API to generate alarm sounds (no audio files needed)

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

// Initialize audio context on first use
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// Alarm Sound Patterns

// Gentle chime - for same-tab alerts
function playChime() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.15);

    gain.gain.setValueAtTime(0, now + i * 0.15);
    gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.5);
  });
}

// Urgent alarm - for idle/doomscrolling alerts
function playUrgentAlarm() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now + i * 0.3);
    osc.frequency.setValueAtTime(660, now + i * 0.3 + 0.15);

    gain.gain.setValueAtTime(0.2, now + i * 0.3);
    gain.gain.setValueAtTime(0.2, now + i * 0.3 + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.3 + 0.29);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.3);
    osc.stop(now + i * 0.3 + 0.3);
  }
}

// Warning horn - for unproductive site alerts (buffalo horn!)
function playBuffaloHorn() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Deep horn sound
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(150, now);
  osc1.frequency.linearRampToValueAtTime(200, now + 0.3);
  osc1.frequency.linearRampToValueAtTime(150, now + 0.8);

  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(152, now);
  osc2.frequency.linearRampToValueAtTime(202, now + 0.3);
  osc2.frequency.linearRampToValueAtTime(152, now + 0.8);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.1);
  gain.gain.setValueAtTime(0.25, now + 0.5);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 1.0);
  osc2.start(now);
  osc2.stop(now + 1.0);
}

// Message Handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'playAlarm') {
    switch (message.sound) {
      case 'chime':
        playChime();
        break;
      case 'urgent':
        playUrgentAlarm();
        break;
      case 'horn':
        playBuffaloHorn();
        break;
      default:
        playChime();
    }
    sendResponse({ status: 'playing' });
  }
  return true;
});
