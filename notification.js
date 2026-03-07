// ===== Notification Page Script =====

const backToWorkBtn = document.getElementById('backToWorkBtn');
const breakBtn = document.getElementById('breakBtn');

// Get notification type from URL params
const params = new URLSearchParams(window.location.search);
const notifType = params.get('type') || 'general';
const subject = params.get('subject') || 'your studies';

// Set message based on type
const messages = {
  idle: {
    title: '🦬 Are you still there?',
    message: `No activity detected! Are you doomscrolling? Get back to ${subject}!`,
    quote: '"Champions train while others complain." — Ralphie 🏔️'
  },
  same_tab: {
    title: '🦬 Time to switch it up!',
    message: `You've been on this tab for a while. Still working on ${subject}?`,
    quote: '"Be Boulder, stay focused." — CU Spirit 💛'
  },
  unproductive_site: {
    title: '🦬 Hey, get back to work!',
    message: `This site isn't helping you study ${subject}. Time to refocus!`,
    quote: '"Sko Buffs! Eyes on the prize." 🎯'
  },
  general: {
    title: '🦬 Focus Check!',
    message: `Hey Buff! Make sure you're staying on track with ${subject}!`,
    quote: '"Be Boulder." — CU Buffalo Spirit 🏔️'
  }
};

const msg = messages[notifType] || messages.general;
document.getElementById('notifTitle').textContent = msg.title;
document.getElementById('notifMessage').textContent = msg.message;
document.getElementById('notifQuote').textContent = msg.quote;

// Back to work - close the notification tab
backToWorkBtn.addEventListener('click', () => {
  window.close();
});

// 5 minute break - sets a timer then closes
breakBtn.addEventListener('click', () => {
  breakBtn.textContent = '⏳ Break started...';
  breakBtn.disabled = true;

  // Notify background of break
  chrome.runtime.sendMessage({ type: 'break', duration: 5 });

  setTimeout(() => {
    window.close();
  }, 2000);
});
