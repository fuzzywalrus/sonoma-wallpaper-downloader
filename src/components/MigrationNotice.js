import React from 'react';

const MigrationNotice = () => {
  const handleDownload = () => {
    // Open the GitHub releases page
    const url = 'https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/releases/latest';

    // For Electron, we need to use shell.openExternal
    // which is exposed through the preload script
    if (window.electron && window.electron.shell && window.electron.shell.openExternal) {
      window.electron.shell.openExternal(url);
    } else {
      // Fallback to regular window.open
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="migration-notice">
      <div className="migration-header">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Important Update Available</span>
      </div>

      <div className="migration-content">
        <p>
          <strong>A new, faster version is available!</strong>
        </p>
        <p>
          We've rebuilt this app using modern technology (Tauri), making it:
        </p>
        <ul>
          <li>✨ <strong>93% smaller</strong> (13 MB instead of 190 MB)</li>
          <li>🚀 <strong>Much faster</strong> startup and performance</li>
          <li>🔋 <strong>Lower memory</strong> usage</li>
          <li>🛡️ <strong>More secure</strong> with native code</li>
        </ul>
        <p>
          <strong>Note:</strong> This upgrade requires a one-time manual download.
          Future updates will work automatically again.
        </p>
      </div>

      <div className="migration-buttons">
        <button className="migration-button primary" onClick={handleDownload}>
          Download New Version
        </button>
        <button className="migration-button secondary" onClick={() => {
          document.querySelector('.migration-notice').style.display = 'none';
        }}>
          Remind Me Later
        </button>
      </div>
    </div>
  );
};

export default MigrationNotice;
