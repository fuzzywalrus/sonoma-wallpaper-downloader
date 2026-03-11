const CUSTOMER_DIR = '/Library/Application Support/com.apple.idleassetsd/Customer/';

const isTauriRuntime = () => (
  typeof window !== 'undefined'
  && (window.__TAURI_INTERNALS__ !== undefined || window.__TAURI__ !== undefined || !!window.tauri)
);

const getEnv = () => {
  if (window.electron) return 'electron';
  if (isTauriRuntime()) return 'tauri';
  return 'web';
};

const invokeTauriCommand = async (command, payload = {}) => {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke(command, payload);
  } catch (importError) {
    const fallbackInvoke = window.__TAURI__?.core?.invoke || window.__TAURI__?.tauri?.invoke;
    if (typeof fallbackInvoke === 'function') {
      return await fallbackInvoke(command, payload);
    }
    throw importError;
  }
};

export const listScreensavers = async () => {
  const env = getEnv();

  if (env === 'electron') {
    if (!window.electron || !window.electron.fs) {
      return [];
    }
    try {
      const files = await window.electron.screensavers.list();
      return files || [];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Electron listScreensavers failed', e);
      throw e;
    }
  }

  if (env === 'tauri') {
    try {
      const files = await invokeTauriCommand('list_screensavers');
      return files || [];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Tauri list_screensavers failed', e);
      throw e;
    }
  }

  // Web-only: no access to local filesystem
  return [];
};

export const deleteScreensaver = async (path) => {
  const env = getEnv();

  if (!path || !path.startsWith(CUSTOMER_DIR)) {
    return false;
  }

  if (env === 'electron') {
    try {
      const result = await window.electron.screensavers.delete(path);
      return !!(result && result.ok);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Electron deleteScreensaver failed', e);
      return false;
    }
  }

  if (env === 'tauri') {
    try {
      const ok = await invokeTauriCommand('delete_screensaver', { targetPath: path });
      return !!ok;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Tauri delete_screensaver failed', e);
      return false;
    }
  }

  return false;
};

export const openFullDiskAccessSettings = async () => {
  const env = getEnv();

  if (env === 'electron') {
    try {
      const result = await window.electron.screensavers.openFullDiskAccessSettings();
      if (!result || !result.ok) {
        // eslint-disable-next-line no-alert
        alert('Unable to open Full Disk Access settings automatically. Please open System Settings → Privacy & Security → Full Disk Access and add Mac Video Wallpaper Manager.');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Electron openFullDiskAccessSettings failed', e);
      // eslint-disable-next-line no-alert
      alert('Unable to open Full Disk Access settings automatically. Please open System Settings → Privacy & Security → Full Disk Access and add Mac Video Wallpaper Manager.');
    }
    return;
  }

  if (env === 'tauri') {
    try {
      await invokeTauriCommand('open_full_disk_access_settings');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Tauri open_full_disk_access_settings failed', e);
      // eslint-disable-next-line no-alert
      alert('Unable to open Full Disk Access settings automatically. Open System Settings → Privacy & Security → Full Disk Access. If you are running in dev mode, build/run the .app bundle and add it manually.');
    }
  }
};

