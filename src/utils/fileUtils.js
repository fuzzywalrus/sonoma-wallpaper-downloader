// Get the appropriate API (Electron or Tauri)
const getApi = () => {
  if (window.tauri) {
    return window.tauri;
  } else if (window.electron) {
    return window.electron;
  }
  return null;
};

// Fallback data for development
const FALLBACK_DATA = {
  assets: [
    {
      accessibilityLabel: "Grand Teton Mountains",
      newLabel: "Grand Teton Mountains",
      "url-4K-SDR-240FPS": "https://sylvan.apple.com/Aerials/2x/Videos/comp_GMT329_180_UHD_HEVC_SDR.mov",
      previewImage: "https://sylvan.apple.com/Aerials/2x/Videos/comp_GMT329_180_UHD_HEVC_SDR_poster.jpg"
    },
    {
      accessibilityLabel: "Lake Tahoe",
      newLabel: "Lake Tahoe",
      "url-4K-SDR-240FPS": "https://sylvan.apple.com/Aerials/2x/Videos/comp_GMT329_112_UHD_HEVC_SDR.mov",
      previewImage: "https://sylvan.apple.com/Aerials/2x/Videos/comp_GMT329_112_UHD_HEVC_SDR_poster.jpg"
    }
  ],
  categories: [
    {
      localizedDescriptionKey: "Landscape",
      subcategories: []
    }
  ]
};

/**
 * Read and parse localized strings file
 * @param {string} localPath - Path to local file
 * @param {string} fallbackUrl - Fallback URL if local file isn't found
 * @returns {Promise<Object>} - Parsed data
 */
export const readLocalizedStrings = async (localPath, fallbackUrl) => {
  console.log('Reading localized strings...');
  try {
    let parsedData;
    const api = getApi();

    // Check if we're in Electron or Tauri environment
    if (api) {
      try {
        // Try to read the file using IPC bridge to main process (Electron) or invoke (Tauri)
        console.log('Attempting to read file via main process:', localPath);
        const data = await api.fs.readFile(localPath);
        console.log('File read successful, parsing data...');
        parsedData = await api.bplistParser.parseBuffer(data);
        console.log('Plist parsing successful');
      } catch (localError) {
        console.log('Local file read or parse failed:', localError.message);
        console.log('Trying fallback URL for plist...');

        try {
          // Fallback to fetch from URL
          parsedData = await fetchAndParsePlist(fallbackUrl);
        } catch (fallbackError) {
          console.error('Fallback plist parsing failed:', fallbackError);
          parsedData = [{}]; // Use empty data as last resort
        }
      }
    } else {
      // In web-only environment, just use the fallback
      try {
        parsedData = await fetchAndParsePlist(fallbackUrl);
      } catch (error) {
        console.error('Web fallback plist parsing failed:', error);
        parsedData = [{}]; // Use empty data as last resort
      }
    }

    return parsedData[0] || {};
  } catch (error) {
    console.error('Error reading localized strings:', error);
    return {};
  }
};

/**
 * Fetch and parse plist from URL
 * @param {string} url - URL to fetch from
 * @returns {Promise<Object>} - Parsed data
 */
const fetchAndParsePlist = async (url) => {
  try {
    console.log('Fetching plist from URL:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Fallback URL failed: ' + response.statusText);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('Got array buffer, size:', arrayBuffer.byteLength);

    const api = getApi();
    // In Electron or Tauri context with API bridge
    if (api && api.bplistParser) {
      // Convert ArrayBuffer to Buffer or Uint8Array that bplist parser can handle
      const buffer = new Uint8Array(arrayBuffer);
      console.log('Parsing bplist via API...');
      return api.bplistParser.parseBuffer(buffer);
    } else {
      // In web context, no bplist parser available
      console.error('No plist parser available in web context');
      return [{}]; // Return empty object as fallback
    }
  } catch (error) {
    console.error('Problem with fallback for plist:', error);
    return [{}];
  }
};

/**
 * Read and parse entries JSON
 * @param {string} localPath - Path to local file
 * @param {string} fallbackUrl - Fallback URL if local file isn't found
 * @returns {Promise<Object>} - Parsed JSON data
 */
export const readEntriesJson = async (localPath, fallbackUrl) => {
  console.log('Reading entries JSON...');
  try {
    let response;
    let isLocalFileAccess = localPath.startsWith('file:///');
    const api = getApi();

    if (api && isLocalFileAccess) {
      // For local file access in Electron or Tauri, use the API bridge
      try {
        // Convert file:/// URL to actual file path
        const filePath = decodeURIComponent(localPath.replace('file:///', '/'));
        console.log('Trying to read local file via API:', filePath);
        const data = await api.fs.readFile(filePath, { encoding: 'utf8' });
        // Parse the JSON manually
        return JSON.parse(data);
      } catch (localError) {
        console.log('Local file read failed via API:', localError.message);
        console.log('Trying fallback URL...');
      }
    }

    // Fallback to fetch API (for web or if API failed)
    try {
      // Use the fallback URL directly if it's not a file:// URL
      // Otherwise try the original URL first
      if (isLocalFileAccess) {
        console.log('Trying fallback URL for JSON:', fallbackUrl);
        response = await fetch(fallbackUrl);
      } else {
        response = await fetch(localPath);
      }
    } catch (error) {
      console.log('Primary URL failed:', error.message);
      if (!isLocalFileAccess) {
        console.log('Trying fallback URL...');
        response = await fetch(fallbackUrl);
      }
    }

    if (!response || !response.ok) {
      console.log('Failed to fetch JSON data, using fallback data');
      return FALLBACK_DATA;
    }

    // Check if the response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Fetched content might not be valid JSON, attempting to parse anyway');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reading entries JSON:', error);
    console.log('Using fallback development data');
    return FALLBACK_DATA;
  }
};