// Apple screensaver asset from entries.json
export interface AppleAsset {
  localizedNameKey?: string;
  accessibilityLabel?: string;
  newLabel?: string;
  'url-4K-SDR-240FPS'?: string;
  previewImage?: string;
  [key: string]: unknown;
}

export interface AppleSubcategory {
  localizedDescriptionKey?: string;
  [key: string]: unknown;
}

export interface AppleCategory {
  localizedDescriptionKey?: string;
  subcategories?: AppleSubcategory[];
  [key: string]: unknown;
}

export interface AppleEntriesData {
  assets: AppleAsset[];
  categories?: AppleCategory[];
  [key: string]: unknown;
}

// File found in the screensaver Customer directory
export interface ScreensaverFile {
  path: string;
  name: string;
  folder: string;
  sizeBytes: number;
  mtimeMs: number;
}

export type RuntimeEnv = 'electron' | 'tauri' | 'web';
