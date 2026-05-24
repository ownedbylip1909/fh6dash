# FH6 Telemetry

Real-time telemetry dashboard for **Forza Horizon 6** on macOS.

Receives live UDP data from the game and displays it as an instrument cluster — multiple layouts, no browser needed.

---

## Install

```bash
brew tap Ownedbylip1909/fh6dash
brew install --cask fh6-telemetry
```

> First launch: right-click the app → **Open** → Open (Gatekeeper warning, app is unsigned)

---

## Forza Setup

1. In FH6: **Settings → HUD & Gameplay → Data Out**
2. **Data Out** → ON
3. **Data Out IP** → your Mac's IP *(shown in the app hub)*
4. **Data Out Port** → `20777`
5. **Data Out Format** → Car Dash

---

## Layouts

| Layout | Description |
|--------|-------------|
| **GT·R** | Nissan GT-R NISMO cluster — red tacho, blue gear badge, boost gauge |
| **MINI** | Minimalist — giant speed number, gear, RPM bar |
| **F·1** | Formula 1 HUD — LED shift lights, data panels, tire temps |
| **NEON** | JDM neon style — glowing boost, tacho and speed gauges |
| **Classic** | Full dashboard with G-force display, track map, drag times |

---

## Features

- Live RPM, speed, boost, gear, tire temps, G-force
- Shift lights (green → yellow → red → blink at redline)
- Drag timer: 0–100 km/h, 100–200 km/h, ¼ mile
- Track position trace
- Car name database with 1000+ vehicles (editable in-app)
- Auto-update notifications via GitHub Releases

---

## Development

```bash
git clone https://github.com/Ownedbylip1909/fh6dash
cd fh6dash
npm install
npm run electron       # run as Electron app
npm run dev            # server only (browser at http://localhost:3000)
```

### Publishing a Release

```bash
git tag v1.x.x
git push origin v1.x.x
```

GitHub Actions builds the DMG automatically and attaches it to the release.  
Then update [`Casks/fh6-telemetry.rb`](https://github.com/Ownedbylip1909/homebrew-fh6dash) with the new version and SHA256.

---

## Stack

- **Electron** — native macOS app window
- **Node.js + TypeScript** — UDP listener (port 20777), HTTP + WebSocket server
- **Canvas 2D** — all gauges rendered in pure canvas, no UI framework

---

## License

MIT
