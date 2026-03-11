import type { AppleEntriesData } from '../types';

const getApi = () => window.tauri ?? window.electron ?? null;

const FALLBACK_DATA: AppleEntriesData = {
  assets: [
    {
      accessibilityLabel: 'Grand Teton Mountains',
      newLabel: 'Grand Teton Mountains',
      'url-4K-SDR-240FPS': 'https://sylvan.apple.com/Aerials/2x/Videos/comp_GMT329_180_UHD_HEVC_SDR.mov',
      previewImage: 'https://sylvan.apple.com/Aerials/2x/Videos/comp_GMT329_180_UHD_HEVC_SDR_poster.jpg',
    },
    {
      accessibilityLabel: 'Lake Tahoe',
      newLabel: 'Lake Tahoe',
      'url-4K-SDR-240FPS': 'https://sylvan.apple.com/Aerials/2x/Videos/comp_GMT329_112_UHD_HEVC_SDR.mov',
      previewImage: 'https://sylvan.apple.com/Aerials/2x/Videos/comp_GMT329_112_UHD_HEVC_SDR_poster.jpg',
    },
  ],
  categories: [{ localizedDescriptionKey: 'Landscape', subcategories: [] }],
};

const fetchAndParsePlist = async (url: string): Promise<unknown[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fallback URL failed: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  const api = getApi();
  if (api?.bplistParser) {
    return api.bplistParser.parseBuffer(new Uint8Array(arrayBuffer));
  }
  return [{}];
};

export const readLocalizedStrings = async (
  localPath: string,
  fallbackUrl: string
): Promise<Record<string, string>> => {
  try {
    const api = getApi();
    if (api) {
      try {
        const data = await api.fs.readFile(localPath);
        const parsed = await api.bplistParser.parseBuffer(data as Uint8Array);
        return (parsed[0] ?? {}) as Record<string, string>;
      } catch {
        // fall through to URL fallback
      }
    }
    const parsed = await fetchAndParsePlist(fallbackUrl);
    return (parsed[0] ?? {}) as Record<string, string>;
  } catch (error) {
    console.error('Error reading localized strings:', error);
    return {};
  }
};

export const readEntriesJson = async (
  localPath: string,
  fallbackUrl: string
): Promise<AppleEntriesData> => {
  const api = getApi();
  const isFileUrl = localPath.startsWith('file:///');

  if (api && isFileUrl) {
    try {
      const filePath = decodeURIComponent(localPath.replace('file:///', '/'));
      const data = await api.fs.readFile(filePath, { encoding: 'utf8' });
      return JSON.parse(data as string) as AppleEntriesData;
    } catch {
      // fall through to URL fallback
    }
  }

  try {
    const response = await fetch(isFileUrl ? fallbackUrl : localPath);
    if (response.ok) return response.json() as Promise<AppleEntriesData>;
  } catch {
    // fall through to hardcoded fallback
  }

  return FALLBACK_DATA;
};
