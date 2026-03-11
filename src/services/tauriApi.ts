/**
 * Tauri API wrapper — provides the same interface as the Electron API so the
 * rest of the codebase works with both runtimes transparently.
 */

const isTauri = (): boolean =>
  typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;

// Lazy-loaded Tauri module references
type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
type CheckFn = () => Promise<unknown>;
type RelaunchFn = () => Promise<void>;

let _invoke: InvokeFn | undefined;
let _check: CheckFn | undefined;
let _relaunch: RelaunchFn | undefined;

const getInvoke = async (): Promise<InvokeFn | undefined> => {
  if (!_invoke && isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    _invoke = invoke as InvokeFn;
  }
  return _invoke;
};

const getCheck = async (): Promise<CheckFn | undefined> => {
  if (!_check && isTauri()) {
    const { check } = await import('@tauri-apps/plugin-updater');
    _check = check as CheckFn;
  }
  return _check;
};

const getRelaunch = async (): Promise<RelaunchFn | undefined> => {
  if (!_relaunch && isTauri()) {
    const { relaunch } = await import('@tauri-apps/plugin-process');
    _relaunch = relaunch as RelaunchFn;
  }
  return _relaunch;
};

const tauriFs = {
  readFile: async (filePath: string, options?: { encoding?: string }): Promise<Uint8Array | string> => {
    const invoke = await getInvoke();
    if (!invoke) throw new Error('Tauri invoke not available');
    const data = await invoke<number[]>('read_file', { filePath, encoding: options?.encoding });
    if (options?.encoding === 'utf8' || options?.encoding === 'utf-8') {
      return new TextDecoder().decode(new Uint8Array(data));
    }
    return new Uint8Array(data);
  },
};

const tauriBplistParser = {
  parseBuffer: async (buffer: Uint8Array | number[]): Promise<unknown[]> => {
    try {
      const invoke = await getInvoke();
      if (!invoke) return [{}];
      const byteArray = Array.isArray(buffer) ? buffer : Array.from(buffer);
      const result = await invoke('parse_bplist', { buffer: byteArray });
      return [result];
    } catch {
      return [{}];
    }
  },
};

const updateListeners: {
  onUpdateAvailable: (() => void) | null;
  onUpdateDownloaded: (() => void) | null;
} = { onUpdateAvailable: null, onUpdateDownloaded: null };

const checkForUpdates = async (): Promise<boolean> => {
  try {
    const check = await getCheck();
    if (!check) return false;
    const update = await check();
    return !!update;
  } catch {
    return false;
  }
};

export const tauri = {
  fs: tauriFs,
  bplistParser: tauriBplistParser,
  send: (channel: string): void => {
    if (channel === 'check_for_updates') checkForUpdates();
  },
  receive: (channel: string, func: () => void): void => {
    if (channel === 'update_available') updateListeners.onUpdateAvailable = func;
    else if (channel === 'update_downloaded') updateListeners.onUpdateDownloaded = func;
  },
  relaunch: async (): Promise<boolean> => {
    try {
      const relaunch = await getRelaunch();
      await relaunch?.();
      return true;
    } catch {
      return false;
    }
  },
};

if (isTauri()) {
  window.tauri = tauri;
}

export default tauri;
