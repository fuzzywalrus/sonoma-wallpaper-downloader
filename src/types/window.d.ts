import type { ScreensaverFile } from './index';

interface ElectronFs {
  readFile(path: string, options?: { encoding?: string }): Promise<Uint8Array | string>;
}

interface ElectronBplist {
  parseBuffer(buffer: Uint8Array | number[]): Promise<unknown[]>;
}

interface ElectronShell {
  openExternal(url: string): void;
}

interface ElectronScreensavers {
  list(): Promise<ScreensaverFile[]>;
  delete(path: string): Promise<{ ok: boolean; error?: string }>;
  openFullDiskAccessSettings(): Promise<{ ok: boolean }>;
}

interface ElectronApi {
  fs: ElectronFs;
  bplistParser: ElectronBplist;
  shell: ElectronShell;
  screensavers: ElectronScreensavers;
  send(channel: string, ...args: unknown[]): void;
  receive(channel: string, func: (...args: unknown[]) => void): void;
}

interface TauriApi {
  fs: ElectronFs;
  bplistParser: ElectronBplist;
  send(channel: string, ...args: unknown[]): void;
  receive(channel: string, func: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    electron?: ElectronApi;
    tauri?: TauriApi;
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: {
      core?: { invoke?: (...args: unknown[]) => Promise<unknown> };
      tauri?: { invoke?: (...args: unknown[]) => Promise<unknown> };
    };
  }
}

export {};
