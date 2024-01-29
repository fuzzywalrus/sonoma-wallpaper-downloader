// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, session, ipcMain } = require('electron')
const path = require('node:path')
const { autoUpdater } = require('electron-updater');

app.commandLine.appendSwitch('ignore-certificate-errors')

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false, // For Electron 12+, you might need to set this to false
    }
    
  })

  // Track file download progress
  mainWindow.webContents.session.on('will-download', (event, downloadItem, webContents) => {
    // Set the save path, making Electron not to prompt a save dialog
    // downloadItem.setSavePath('/path/to/save/the/file');

    downloadItem.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (downloadItem.isPaused()) {
          console.log('Download is paused')
        } else {
          console.log(`Received bytes: ${downloadItem.getReceivedBytes()}`)
        }
      }
      webContents.send('download-progress', downloadItem.getReceivedBytes(), downloadItem.getTotalBytes());
    })

    downloadItem.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully')
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify();
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

autoUpdater.on('update-available', () => {
  // Notify the renderer process that an update is available
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  // Notify the renderer process that the update has been downloaded
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.