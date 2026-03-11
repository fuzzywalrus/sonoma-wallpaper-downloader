// Modules to control application life and create native browser window
const { app, BrowserWindow, session, ipcMain, shell } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const fs = require('fs').promises;
const fssync = require('fs');
const bplistParser = require('bplist-parser');

// Set up the logger for autoUpdater
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

// Ignore certificate errors (should be used cautiously)
app.commandLine.appendSwitch('ignore-certificate-errors');

let mainWindow; // Declare mainWindow globally

const createWindow = () => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true, // Security: isolate renderer process
      webSecurity: true,
      sandbox: false
    }
  });
  
  console.log('Preload script path:', path.join(__dirname, 'preload.js'));
  
  // Track file download progress
  mainWindow.webContents.session.on('will-download', (event, downloadItem, webContents) => {
    downloadItem.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (downloadItem.isPaused()) {
          console.log('Download is paused');
        } else {
          console.log(`Received bytes: ${downloadItem.getReceivedBytes()}`);
        }
      }
      
      // Send progress to renderer
      webContents.send('download-progress', 
        downloadItem.getReceivedBytes(), 
        downloadItem.getTotalBytes()
      );
    });

    downloadItem.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully completed');
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  });

  // In development, load from React dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built app
    mainWindow.loadFile(path.join(__dirname, '../../build/index.html'));
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.webContents.send('main-process-ready');
  });
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Auto updater events
autoUpdater.on('update-available', () => {
  // Notify the renderer process that an update is available
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  // Notify the renderer process that the update has been downloaded
  mainWindow.setClosable(true);
  mainWindow.webContents.send('update_downloaded');
});

// IPC handlers
ipcMain.on('restart_app', () => {
  console.log('restart_app');
  autoUpdater.quitAndInstall();
});

ipcMain.on('test', () => {
  console.log('test received!');
});

// Add IPC handlers for fs and bplist operations
ipcMain.handle('fs:readFile', async (event, filePath, options) => {
  console.log('Reading file:', filePath);
  try {
    // Handle file:// URLs by converting them to paths
    if (filePath.startsWith('file://')) {
      filePath = filePath.replace('file:///', '/');
      filePath = decodeURIComponent(filePath);
    }
    
    console.log('Resolved file path:', filePath);
    return await fs.readFile(filePath, options);
  } catch (error) {
    console.error('Error reading file:', error);
    throw error; // This will be sent back to the renderer as an error
  }
});

ipcMain.handle('bplist:parseBuffer', async (event, buffer) => {
  console.log('Parsing bplist buffer, size:', buffer.length);
  try {
    // Check if the buffer actually contains a binary plist
    if (buffer.length >= 8) {
      const signature = Buffer.from(buffer.slice(0, 8)).toString('ascii');
      console.log('File signature:', signature);
      
      if (signature.startsWith('bplist')) {
        return bplistParser.parseBuffer(Buffer.from(buffer));
      } else {
        console.log('Not a binary plist, trying to parse as text plist or returning empty data');
        // This might be a text plist or something else
        // For now, return an empty object
        return [{}];
      }
    } else {
      console.log('Buffer too small to be a valid plist');
      return [{}];
    }
  } catch (error) {
    console.error('Error parsing bplist:', error);
    // Return empty data instead of throwing
    return [{}];
  }
});

const CUSTOMER_DIR = '/Library/Application Support/com.apple.idleassetsd/Customer';
const VIDEO_EXTENSIONS = ['.mov', '.mp4', '.m4v', '.hevc'];

function isVideoFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
}

async function listCustomerFiles() {
  const results = [];

  try {
    const entries = await fs.readdir(CUSTOMER_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const subdir = path.join(CUSTOMER_DIR, entry.name);
      const files = await fs.readdir(subdir, { withFileTypes: true });
      for (const file of files) {
        if (!file.isFile()) continue;
        const fullPath = path.join(subdir, file.name);
        if (!isVideoFile(fullPath)) continue;
        try {
          const stat = await fs.stat(fullPath);
          results.push({
            path: fullPath,
            name: file.name,
            folder: entry.name,
            sizeBytes: stat.size,
            mtimeMs: stat.mtimeMs,
          });
        } catch (e) {
          console.error('Error statting file', fullPath, e);
        }
      }
    }
  } catch (e) {
    console.error('Error reading Customer directory', e);
    throw e;
  }

  return results;
}

ipcMain.handle('screensavers:list', async () => {
  return listCustomerFiles();
});

ipcMain.handle('screensavers:delete', async (event, targetPath) => {
  try {
    if (!targetPath.startsWith(CUSTOMER_DIR)) {
      throw new Error('Refusing to delete outside Customer directory');
    }
    if (!isVideoFile(targetPath)) {
      throw new Error('Refusing to delete non-video file');
    }
    await fs.unlink(targetPath);
    return { ok: true };
  } catch (e) {
    console.error('Failed to delete screensaver file', targetPath, e);
    return { ok: false, error: e.message || String(e) };
  }
});

ipcMain.handle('screensavers:openFullDiskAccessSettings', async () => {
  try {
    await shell.openExternal(
      'x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles'
    );
    return { ok: true };
  } catch (e) {
    console.error('Failed to open Full Disk Access settings', e);
    return { ok: false, error: e.message || String(e) };
  }
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});