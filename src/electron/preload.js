const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // File system access - we won't directly expose Node's fs module
  // Instead, we'll create a bridge to the main process to handle file operations
  fs: {
    readFile: (filePath, options) => {
      return ipcRenderer.invoke('fs:readFile', filePath, options);
    },
  },
  
  // bplist parser functionality will also be handled by the main process
  bplistParser: {
    parseBuffer: (buffer) => {
      return ipcRenderer.invoke('bplist:parseBuffer', buffer);
    },
  },
  
  // Send messages to the main process
  send: (channel, ...args) => {
    const validChannels = ['restart_app', 'test', 'check_for_updates'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
  
  // Receive messages from the main process
  receive: (channel, func) => {
    const validChannels = ['update_available', 'update_downloaded', 'download-progress'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});