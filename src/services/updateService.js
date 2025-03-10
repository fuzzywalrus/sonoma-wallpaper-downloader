/**
 * Service to handle application updates
 * Only works in Electron environment
 */

/**
 * Check for updates
 * @returns {Promise<boolean>} - Promise resolving to whether an update check was initiated
 */
export const checkForUpdates = () => {
  if (window.electron) {
    // Simply send a message to the main process to check for updates
    window.electron.send('check_for_updates');
    return Promise.resolve(true);
  }
  
  // Not in Electron environment
  console.log('Update checking is only available in Electron environment');
  return Promise.resolve(false);
};

/**
 * Install downloaded updates and restart the app
 * @returns {Promise<boolean>} - Promise resolving to whether restart was initiated
 */
export const installUpdate = () => {
  if (window.electron) {
    window.electron.send('restart_app');
    return Promise.resolve(true);
  }
  
  // Not in Electron environment
  console.log('Update installation is only available in Electron environment');
  return Promise.resolve(false);
};

/**
 * Initialize update listeners
 * @param {Function} onUpdateAvailable - Callback when update is available
 * @param {Function} onUpdateDownloaded - Callback when update is downloaded
 */
export const initUpdateListeners = (onUpdateAvailable, onUpdateDownloaded) => {
  if (window.electron) {
    // Set up listeners for update events from Electron main process
    window.electron.receive('update_available', () => {
      if (typeof onUpdateAvailable === 'function') {
        onUpdateAvailable();
      }
    });

    window.electron.receive('update_downloaded', () => {
      if (typeof onUpdateDownloaded === 'function') {
        onUpdateDownloaded();
      }
    });
    
    return true;
  }
  
  // Not in Electron environment
  console.log('Update listeners are only available in Electron environment');
  return false;
};