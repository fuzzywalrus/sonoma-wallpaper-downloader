/**
 * Service to handle application updates
 * Works in both Electron and Tauri environments
 */

/**
 * Check for updates
 * @returns {Promise<boolean>} - Promise resolving to whether an update check was initiated
 */
export const checkForUpdates = () => {
  const api = window.electron || window.tauri;

  if (api) {
    // Send a message to check for updates
    api.send('check_for_updates');
    return Promise.resolve(true);
  }

  // Not in desktop environment
  console.log('Update checking is only available in desktop environment');
  return Promise.resolve(false);
};

/**
 * Install downloaded updates and restart the app
 * @returns {Promise<boolean>} - Promise resolving to whether restart was initiated
 */
export const installUpdate = () => {
  const api = window.electron || window.tauri;

  if (api) {
    api.send('restart_app');
    return Promise.resolve(true);
  }

  // Not in desktop environment
  console.log('Update installation is only available in desktop environment');
  return Promise.resolve(false);
};

/**
 * Initialize update listeners
 * @param {Function} onUpdateAvailable - Callback when update is available
 * @param {Function} onUpdateDownloaded - Callback when update is downloaded
 */
export const initUpdateListeners = (onUpdateAvailable, onUpdateDownloaded) => {
  const api = window.electron || window.tauri;

  if (api) {
    // Set up listeners for update events
    api.receive('update_available', () => {
      if (typeof onUpdateAvailable === 'function') {
        onUpdateAvailable();
      }
    });

    api.receive('update_downloaded', () => {
      if (typeof onUpdateDownloaded === 'function') {
        onUpdateDownloaded();
      }
    });

    return true;
  }

  // Not in desktop environment
  console.log('Update listeners are only available in desktop environment');
  return false;
};