# Auto Extension Reloader — Chrome Extension

**The Chrome half of [Auto Extension Reloader](https://github.com/AnushkaMadushanka/auto-extension-reloader).** It listens to your webpack build over a local socket, shows you the build state in the toolbar, and reloads your extension the instant the build lands.

[![Video](https://img.shields.io/badge/▶-Watch%20the%20demo-red)](https://www.youtube.com/watch?v=gczjrjCIrVU)
[![npm plugin](https://img.shields.io/npm/v/auto-extension-reloader?label=webpack%20plugin)](https://www.npmjs.com/package/auto-extension-reloader)
![React](https://img.shields.io/badge/React-16-61DAFB)
![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4)

<img src="https://raw.githubusercontent.com/AnushkaMadushanka/anushkamadushanka.github.com/gh-pages/projects/aer.webp" alt="Auto Extension Reloader" width="600">

> This is the receiver. The sender — the webpack plugin you add to your own project — lives in [auto-extension-reloader](https://github.com/AnushkaMadushanka/auto-extension-reloader).

---

## What it does

The background page opens a `socket.io` client to `localhost:8890` and reacts to two events the webpack plugin emits:

**On `build.start`** — fires a desktop notification carrying the extension's own name and icon (looked up through `chrome.management.get`), then starts cycling the toolbar icon through eight frames on a 500 ms timer, so you get an animated spinner telling you a build is in flight.

**On `build.end`** — notifies again, stops the spinner, and reloads.

### Reloading an extension without a reload API

Chrome has no "reload this extension" call. The trick is that toggling an extension off and on again re-reads it from disk, so `reloadExtensionUsingId` does exactly that:

```js
await this.setExtensionState(extensionId, false)
await this.setExtensionState(extensionId, true)
```

Both `chrome.management.setEnabled` calls are promisified so the disable strictly completes before the enable — otherwise Chrome can collapse them and nothing reloads.

## The popup

A React + Material-UI popup with two tabs:

- **Settings** — toggle *reload all dev extensions on build* (useful when you're working on a set of extensions that depend on each other), toggle *reload all open tabs on build* (so your content script changes take effect without touching the browser), and change the socket port.
- **Extensions** — a live list of every installed extension from `chrome.management.getAll`, each with its ID, so you can copy the ID straight into your webpack config.

Plus two one-click buttons: **Reload All Dev Extensions** and **Reload All Tabs**, for when you want a reload without a build.

Settings persist in `chrome.storage.local`, and the background page skips itself when reloading everything — otherwise it would kill its own socket mid-reload.

## Building and installing

```bash
git clone https://github.com/AnushkaMadushanka/auto-extension-reloader-chrome.git
cd auto-extension-reloader-chrome
npm install
npm start          # webpack build
```

Then open `chrome://extensions`, enable **Developer mode**, click **Load unpacked** and select the build output.

Finally, add the [webpack plugin](https://www.npmjs.com/package/auto-extension-reloader) to the extension project you're actually developing.

## Built with

| | |
|---|---|
| UI | React 16, Material-UI 4, react-swipeable-views |
| Transport | socket.io-client |
| Build | webpack 4, Babel |
| Chrome APIs | `management`, `notifications`, `storage`, `tabs`, `browserAction` |

## Project layout

```
├── manifest.json                      MV2 manifest, permissions, icons
├── scripts/background.js              socket client, reload logic, notifications, icon animation
├── scripts/content.js                 content script stub
├── app/index.js, index.html           popup entry
├── app/components/popup/popup.js      settings + extension list UI
├── app/components/popup/extension-card.js
├── app/components/popup/tab-panel.js
└── public/images/rotation/            8-frame toolbar build spinner
```

## Status

Built in 2019 on **Manifest V2** with a persistent background page. Chrome has since retired MV2 — running it today means porting the background page to a service worker, which changes how the socket connection is held open.

---

Built by [Anushka Madushanka](https://anushkamadushanka.github.io) · [More projects](https://anushkamadushanka.github.io/#projects)
