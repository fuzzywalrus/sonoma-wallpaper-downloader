import type { ScreensaverFile, RuntimeEnv } from '../types';

const CUSTOMER_DIR = '/Library/Application Support/com.apple.idleassetsd/Customer/';

const isTauriRuntime = (): boolean =>
  typeof window !== 'undefined' &&
  (window.__TAURI_INTERNALS__ !== undefined || !!window.__TAURI__ || !!window.tauri);

const getEnv = (): RuntimeEnv => {
  if (window.electron) return 'electron';
  if (isTauriRuntime()) return 'tauri';
  return 'web';
};

const invokeTauriCommand = async <T>(command: string, payload: Record<string, unknown> = {}): Promise<T> => {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, payload);
};

export const listScreensavers = async (): Promise<ScreensaverFile[]> => {
  const env = getEnv();

  if (env === 'electron') {
    if (!window.electron?.screensavers) return [];
    return window.electron.screensavers.list();
  }

  if (env === 'tauri') {
    return invokeTauriCommand<ScreensaverFile[]>('list_screensavers');
  }

  return [];
};

export const deleteScreensaver = async (path: string): Promise<boolean> => {
  const env = getEnv();

  if (!path || !path.startsWith(CUSTOMER_DIR)) return false;

  if (env === 'electron') {
    try {
      const result = await window.electron!.screensavers.delete(path);
      return !!(result?.ok);
    } catch {
      return false;
    }
  }

  if (env === 'tauri') {
    try {
      const ok = await invokeTauriCommand<boolean>('delete_screensaver', { targetPath: path });
      return !!ok;
    } catch {
      return false;
    }
  }

  return false;
};

export const openFullDiskAccessSettings = async (): Promise<void> => {
  const env = getEnv();
  const fallbackMessage =
    'Unable to open Full Disk Access settings automatically. Please open System Settings → Privacy & Security → Full Disk Access and add Mac Video Wallpaper Manager.';

  if (env === 'electron') {
    try {
      const result = await window.electron!.screensavers.openFullDiskAccessSettings();
      if (!result?.ok) alert(fallbackMessage);
    } catch {
      alert(fallbackMessage);
    }
    return;
  }

  if (env === 'tauri') {
    try {
      await invokeTauriCommand('open_full_disk_access_settings');
    } catch {
      alert(
        'Unable to open Full Disk Access settings automatically. Open System Settings → Privacy & Security → Full Disk Access. If running in dev mode, build/run the .app bundle and add it manually.'
      );
    }
  }
};
