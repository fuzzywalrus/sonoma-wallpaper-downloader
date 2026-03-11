import React, { useState } from 'react';

const RELEASES_URL = 'https://github.com/fuzzywalrus/sonoma-wallpaper-downloader/releases/latest';

const MigrationNotice: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDownload = () => {
    if (window.electron?.shell?.openExternal) {
      window.electron.shell.openExternal(RELEASES_URL);
    } else {
      window.open(RELEASES_URL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-lg p-6 my-5 shadow-[0_8px_24px_rgba(102,126,234,0.3)] animate-slide-in">
      <div className="flex items-center mb-4 text-lg font-semibold">
        <svg className="mr-3 shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Important Update Available</span>
      </div>
      <div className="mb-5 leading-relaxed">
        <p className="text-white my-3"><strong>A new, faster version is available!</strong></p>
        <p className="text-white my-3">We've rebuilt this app using modern technology (Tauri), making it:</p>
        <ul className="list-none p-0 my-4">
          <li className="py-2 text-[15px]">✨ <strong>93% smaller</strong> (13 MB instead of 190 MB)</li>
          <li className="py-2 text-[15px]">🚀 <strong>Much faster</strong> startup and performance</li>
          <li className="py-2 text-[15px]">🔋 <strong>Lower memory</strong> usage</li>
          <li className="py-2 text-[15px]">🛡️ <strong>More secure</strong> with native code</li>
        </ul>
        <p className="text-white my-3">
          <strong>Note:</strong> This upgrade requires a one-time manual download. Future updates will work automatically again.
        </p>
      </div>
      <div className="flex gap-3 mt-5">
        <button
          type="button"
          className="flex-1 px-6 py-3 rounded-lg text-sm font-semibold bg-white text-[#667eea] border-none cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={handleDownload}
        >
          Download New Version
        </button>
        <button
          type="button"
          className="flex-1 px-6 py-3 rounded-lg text-sm font-semibold bg-white/20 text-white border border-white/30 cursor-pointer transition-colors hover:bg-white/30"
          onClick={() => setDismissed(true)}
        >
          Remind Me Later
        </button>
      </div>
    </div>
  );
};

export default MigrationNotice;
