# 🛡️ FocusGuard — HackCU 12

A productivity Chrome extension that keeps you on track during study and work sessions.

## Features

- **Focus Sessions** — Set a subject and start a timed focus session
- **Distraction Detection** — Get notified if you visit unproductive sites (YouTube, Reddit, Twitter, TikTok, etc.)
- **Idle Alerts** — Reminds you to get back to work when no keyboard/mouse activity is detected
- **Tab Monitoring** — Warns you if you've been stuck on the same page for too long (30 min)
- **Live Stats** — Track alerts, distractions, and idle warnings in the popup

## Installation

1. Clone this repo:
   ```bash
   git clone https://github.com/Mandalay-Aung/HackCU12.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **"Load unpacked"**
5. Select the `HackCU12` folder
6. Click the FocusGuard icon in your toolbar to start a session!

## Tech Stack

- **Chrome Extension** (Manifest V3)
- **HTML / CSS / JavaScript** — pure, no frameworks
- **Chrome APIs** — Tabs, Storage, Notifications, Idle

## Project Structure

```
HackCU12/
├── manifest.json     # Extension config
├── popup.html        # Popup UI
├── popup.css         # Styling
├── popup.js          # Popup logic
├── background.js     # Background monitoring
├── content.js        # Activity detection
├── icons/            # Extension icons
└── README.md
```

## Team

Built at **HackCU 12** 🏔️
