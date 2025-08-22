macOS launchd scheduler (optional)

Overview

- This folder contains a launchd plist template to periodically run the meme checker and show a native notification if new images are detected.

Setup

1. Replace **REPO_PATH** in com.wakeupnpc.check-new-memes.plist with your absolute repo path.
2. Ensure a logs directory exists in the repo (a .gitignore is provided to keep it empty).
3. Copy the plist to ~/Library/LaunchAgents/ and load it with launchctl.

Notes

- The task runs every 30 minutes (StartInterval 1800) and at login (RunAtLoad true).
- The checker exits with code 2 when new images are found; a macOS notification is fired only on new items.
- You can also run it ad-hoc via: pnpm check:new-memes:notify
