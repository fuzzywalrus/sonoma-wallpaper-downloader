import { sortJson } from '../utils/sortJson';
import { reorderJson } from '../utils/reorderJson';
import { readLocalizedStrings, readEntriesJson } from '../utils/fileUtils';
import type { AppleAsset } from '../types';

const LOCALIZED_STRINGS_PATH =
  '/Library/Application Support/com.apple.idleassetsd/Customer/TVIdleScreenStrings.bundle/en.lproj/Localizable.nocache.strings';
const ENTRIES_JSON_PATH =
  'file:///Library/Application%20Support/com.apple.idleassetsd/Customer/entries.json';
const FALLBACK_LOCALIZED_STRINGS = 'https://assets.codepen.io/168181/Localizable.nocache.strings';
const FALLBACK_ENTRIES_JSON = 'https://assets.codepen.io/168181/entries.json';

export const fetchAndProcessData = async (): Promise<AppleAsset[]> => {
  try {
    const references = (await readLocalizedStrings(LOCALIZED_STRINGS_PATH, FALLBACK_LOCALIZED_STRINGS)) ?? {};
    const jsonData = await readEntriesJson(ENTRIES_JSON_PATH, FALLBACK_ENTRIES_JSON);
    if (!jsonData) throw new Error('Failed to load entries JSON');

    const sorted = sortJson(jsonData, references as Record<string, string>);
    const ordered = reorderJson(sorted);
    return ordered.assets ?? [];
  } catch (error) {
    console.error('Error in fetchAndProcessData:', error);
    return [];
  }
};
