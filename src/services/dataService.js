import { sortJson } from '../utils/sortJson';
import { reorderJson } from '../utils/reorderJson';
import { readLocalizedStrings, readEntriesJson } from '../utils/fileUtils';

// Constants for file paths
const LOCALIZED_STRINGS_PATH = '/Library/Application Support/com.apple.idleassetsd/Customer/TVIdleScreenStrings.bundle/en.lproj/Localizable.nocache.strings';
const ENTRIES_JSON_PATH = 'file:///Library/Application%20Support/com.apple.idleassetsd/Customer/entries.json';

// Fallbacks
const FALLBACK_LOCALIZED_STRINGS = 'https://assets.codepen.io/168181/Localizable.nocache.strings';
const FALLBACK_ENTRIES_JSON = 'https://assets.codepen.io/168181/entries.json';

/**
 * Fetches and processes the Apple wallpaper data
 * @returns {Promise<Array>} - Processed assets array
 */
const fetchAndProcessData = async () => {
  console.log('fetchAndProcessData: Starting data fetch');
  try {
    // Step 1: Read localized strings
    let references = await readLocalizedStrings(
      LOCALIZED_STRINGS_PATH, 
      FALLBACK_LOCALIZED_STRINGS
    );
    
    if (!references) {
      console.warn('Failed to load localized strings, using empty object');
      references = {};
    }
    
    // Step 2: Read entries JSON
    const jsonData = await readEntriesJson(
      ENTRIES_JSON_PATH,
      FALLBACK_ENTRIES_JSON
    );
    
    if (!jsonData) {
      throw new Error('Failed to load entries JSON');
    }
    
    // Step 3: Process the data
    const sortedData = sortJson(jsonData, references);
    const orderedData = reorderJson(sortedData, references);
    
    console.log('fetchAndProcessData: Data processed successfully');
    // Return just the assets array for the component
    return orderedData.assets || [];
  } catch (error) {
    console.error('Error in fetchAndProcessData:', error);
    return [];
  }
};

export { fetchAndProcessData };