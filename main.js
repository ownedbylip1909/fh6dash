const { app, BrowserWindow, Tray, Menu, nativeImage, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path  = require('path');
const http  = require('http');

let mainWindow = null;
let tray       = null;

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

// ── Load server in-process (works in packaged app) ──
function startServer() {
  try {
    require(path.join(__dirname, 'dist', 'server.js'));
  } catch (err) {
    console.error('Failed to start server:', err.message);
  }
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
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const load = () => mainWindow && mainWindow.loadURL('http://localhost:3000/index.html');

  // Retry if server isn't ready yet
  mainWindow.webContents.on('did-fail-load', () => setTimeout(load, 500));

  load();

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── System tray ──
function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('FH6 Telemetry');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Dashboard öffnen', click: () => { if (mainWindow) mainWindow.show(); else createWindow(); } },
    { type: 'separator' },
    { label: 'Beenden', click: () => app.quit() },
  ]));
}

// ── Auto updater ──
function setupUpdater() {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update verfügbar',
      message: 'Eine neue Version wird heruntergeladen.',
      buttons: ['OK'],
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update bereit',
      message: 'Update installiert. App wird neu gestartet.',
      buttons: ['Jetzt neu starten', 'Später'],
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  });
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
  if (app.isPackaged) setupUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
