/**
 * Tauri API wrapper - provides the same interface as the Electron API
 * This allows the rest of the codebase to work with both Electron and Tauri
 */

// Check if we're running in Tauri
const isTauri = () => {
  return typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;
};

// Lazy load Tauri modules
let _invoke, _check, _relaunch;

const getInvoke = async () => {
  if (!_invoke && isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    _invoke = invoke;
  }
  return _invoke;
};

const getCheck = async () => {
  if (!_check && isTauri()) {
    const { check } = await import('@tauri-apps/plugin-updater');
    _check = check;
  }
  return _check;
};

const getRelaunch = async () => {
  if (!_relaunch && isTauri()) {
    const { relaunch } = await import('@tauri-apps/plugin-process');
    _relaunch = relaunch;
  }
  return _relaunch;
};

// File system API
const tauriFs = {
  readFile: async (filePath, options) => {
    try {
      const invoke = await getInvoke();
      const data = await invoke('read_file', {
        filePath,
        encoding: options?.encoding
      });

      // If encoding was specified, convert the byte array to string
      if (options?.encoding === 'utf8' || options?.encoding === 'utf-8') {
        const decoder = new TextDecoder();
        return decoder.decode(new Uint8Array(data));
      }

      return data;
    } catch (error) {
      console.error('Tauri readFile error:', error);
      throw new Error(`Failed to read file: ${error}`);
    }
  }
};

// bplist parser API
const tauriBplistParser = {
  parseBuffer: async (buffer) => {
    try {
      const invoke = await getInvoke();
      // Convert buffer to array if needed
      const byteArray = Array.isArray(buffer) ? buffer : Array.from(buffer);
      const result = await invoke('parse_bplist', { buffer: byteArray });

      // Wrap result in array to match electron-bplist-parser format
      return [result];
    } catch (error) {
      console.error('Tauri bplist parse error:', error);
      return [{}];
    }
  }
};

// Update API
const checkForUpdates = async () => {
  try {
    const check = await getCheck();
    const update = await check();
    if (update) {
      console.log('Update available:', update);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return false;
  }
};

// eslint-disable-next-line no-unused-vars
const installUpdate = async () => {
  try {
    const relaunch = await getRelaunch();
    await relaunch();
    return true;
  } catch (error) {
    console.error('Failed to restart app:', error);
    return false;
  }
};

// Event listeners for updates
const updateListeners = {
  onUpdateAvailable: null,
  onUpdateDownloaded: null
};

// eslint-disable-next-line no-unused-vars
const initUpdateListeners = (onUpdateAvailable, onUpdateDownloaded) => {
  updateListeners.onUpdateAvailable = onUpdateAvailable;
  updateListeners.onUpdateDownloaded = onUpdateDownloaded;

  // Tauri updater works differently - we check manually
  // and show dialogs directly
  return true;
};

// Export Tauri API in the same shape as Electron API
export const tauri = {
  fs: tauriFs,
  bplistParser: tauriBplistParser,
  send: (channel, ...args) => {
    // Tauri doesn't use channels like Electron
    // Handle specific cases
    if (channel === 'check_for_updates') {
      checkForUpdates();
    }
  },
  receive: (channel, func) => {
    // Store listeners
    if (channel === 'update_available') {
      updateListeners.onUpdateAvailable = func;
    } else if (channel === 'update_downloaded') {
      updateListeners.onUpdateDownloaded = func;
    }
  }
};

// Make tauri available on window object similar to electron
if (isTauri()) {
  console.log('🚀 Tauri environment detected!');
  window.tauri = tauri;
} else {
  console.log('Not in Tauri environment');
}

export default tauri;
