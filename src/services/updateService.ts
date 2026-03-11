const getApi = () => window.electron ?? window.tauri;

export const checkForUpdates = (): Promise<boolean> => {
  const api = getApi();
  if (api) {
    api.send('check_for_updates');
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
};

export const installUpdate = (): Promise<boolean> => {
  const api = getApi();
  if (api) {
    api.send('restart_app');
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
};

export const initUpdateListeners = (
  onUpdateAvailable: () => void,
  onUpdateDownloaded: () => void
): boolean => {
  const api = getApi();
  if (!api) return false;
  api.receive('update_available', onUpdateAvailable);
  api.receive('update_downloaded', onUpdateDownloaded);
  return true;
};
