/**
 * Service to handle downloading of files
 * In Electron environment, this interacts with Electron's download API
 * In web-only environments, it uses browser's native download capabilities
 */

/**
 * Initiates a download of a file from a URL
 * 
 * @param {string} url - URL of the file to download
 * @param {string} filename - Optional filename to save as
 * @returns {Promise<boolean>} - Promise resolving to success status
 */
export const downloadFile = async (url, filename = '') => {
  try {
    // Check if we're in Electron or Tauri environment
    if (window.electron || window.tauri) {
      // In Electron/Tauri, trigger download by navigating to URL
      // The desktop app will handle the download automatically
      window.location.href = url;
      return true;
    } else {
      // In a web-only environment, use fetch and saveAs
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Create a temporary link element to trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);

      // Use the provided filename or extract from the URL
      if (filename) {
        downloadLink.download = filename;
      } else {
        // Extract filename from URL or Content-Disposition header
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            downloadLink.download = filenameMatch[1];
          }
        } else {
          // Extract from URL if no Content-Disposition header
          const urlParts = url.split('/');
          downloadLink.download = urlParts[urlParts.length - 1];
        }
      }

      // Trigger the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up the object URL
      URL.revokeObjectURL(downloadLink.href);

      return true;
    }
  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
};

/**
 * Track and cancel active downloads
 * Note: This is primarily for web environment as Electron's download manager
 * handles these operations differently
 */
export class DownloadManager {
  constructor() {
    this.activeDownloads = new Map();
  }
  
  /**
   * Start a new download and track it
   * @param {string} url - URL to download
   * @param {string} filename - Optional filename
   * @returns {string} - Download ID
   */
  startDownload(url, filename = '') {
    const downloadId = `dl_${Date.now()}`;
    
    // Start the download
    downloadFile(url, filename)
      .then(success => {
        if (success) {
          this.activeDownloads.delete(downloadId);
        }
      })
      .catch(error => {
        console.error('Download failed:', error);
        this.activeDownloads.delete(downloadId);
      });
    
    // Track this download
    this.activeDownloads.set(downloadId, { url, filename });
    
    return downloadId;
  }
  
  /**
   * Get all active downloads
   * @returns {Map} - Map of active downloads
   */
  getActiveDownloads() {
    return this.activeDownloads;
  }
}

// Create and export a singleton instance
export const downloadManager = new DownloadManager();