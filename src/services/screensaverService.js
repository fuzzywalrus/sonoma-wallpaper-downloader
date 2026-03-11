const CUSTOMER_DIR = '/Library/Application Support/com.apple.idleassetsd/Customer/';

const getEnv = () => {
  if (window.tauri) return 'tauri';
  if (window.electron) return 'electron';
  return 'web';
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
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      const { invoke } = window.__TAURI__?.tauri || require('@tauri-apps/api/tauri');
      const files = await invoke('list_screensavers');
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
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      const { invoke } = window.__TAURI__?.tauri || require('@tauri-apps/api/tauri');
      const ok = await invoke('delete_screensaver', { targetPath: path });
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
        alert('Unable to open Full Disk Access settings automatically. Please open System Settings → Privacy & Security → Full Disk Access and add macOS Video Downloader.');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Electron openFullDiskAccessSettings failed', e);
      // eslint-disable-next-line no-alert
      alert('Unable to open Full Disk Access settings automatically. Please open System Settings → Privacy & Security → Full Disk Access and add macOS Video Downloader.');
    }
    return;
  }

  if (env === 'tauri') {
    try {
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      const { invoke } = window.__TAURI__?.tauri || require('@tauri-apps/api/tauri');
      await invoke('open_full_disk_access_settings');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Tauri open_full_disk_access_settings failed', e);
    }
  }
};


