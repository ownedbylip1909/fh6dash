const { app, BrowserWindow, Tray, Menu, nativeImage, shell } = require('electron');
const { spawn } = require('child_process');
const path  = require('path');
const http  = require('http');

let mainWindow   = null;
let tray         = null;
let serverProcess = null;

// ── Poll until the HTTP server is up ──
function waitForServer(retries = 40) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http.get('http://localhost:3000/ip', res => {
        res.resume();
        resolve();
      }).on('error', () => {
        if (retries-- > 0) setTimeout(attempt, 150);
        else reject(new Error('Server did not start'));
      });
    };
    attempt();
  });
}

// ── Start the Node server as a child process ──
function startServer() {
  const node = process.execPath; // the Node bundled inside Electron

  serverProcess = spawn(node, [path.join(__dirname, 'dist', 'server.js')], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  serverProcess.stdout.on('data', d => process.stdout.write('[server] ' + d));
  serverProcess.stderr.on('data', d => process.stderr.write('[server] ' + d));
  serverProcess.on('error', err => console.error('Server error:', err.message));
  serverProcess.on('exit', code => console.log('Server exited with code', code));
}

// ── Create the main window ──
function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1440,
    height: 920,
    minWidth:  900,
    minHeight: 600,
    title: 'FH6 Telemetry',
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',   // macOS traffic lights inset
    trafficLightPosition: { x: 14, y: 14 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL('http://localhost:3000/gtr.html');

  // Open any external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── System tray ──
function createTray() {
  // 16×16 blank icon — replace with a real PNG for production
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('FH6 Telemetry');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Dashboard öffnen', click: () => { if (mainWindow) mainWindow.show(); else createWindow(); } },
    { type: 'separator' },
    { label: 'Beenden', click: () => app.quit() },
  ]));
}

// ── App lifecycle ──
app.whenReady().then(async () => {
  startServer();

  try {
    await waitForServer();
    console.log('Server ready — opening window');
  } catch (e) {
    console.error('Server did not respond, opening anyway');
  }

  createWindow();
  if (process.platform === 'darwin') createTray();
});

app.on('before-quit', () => {
  if (serverProcess) { serverProcess.kill(); serverProcess = null; }
});

app.on('window-all-closed', () => {
  // On macOS keep app alive via tray
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
