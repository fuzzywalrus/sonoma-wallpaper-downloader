import React, { useState } from 'react';
// Correct the import to match the exports from downloadService.js
import { downloadFile } from '../services/downloadService';

const DownloadItem = ({ label, url, previewImage }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  if (!label || !url || !previewImage) {
    return null;
  }

  const handleDownload = (e) => {
    e.preventDefault();
    
    // Generate a filename from the label
    const filename = label
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '.mp4';
      
    // Initiate download
    downloadFile(url, filename);
  };

  return (
    <li className="download-item">
      <a 
        href={url} 
        onClick={handleDownload}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="image-container">
          <img src={previewImage} alt={label} />
          {isHovering && (
            <div className="download-overlay">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
          )}
        </div>
        <span>{label}</span>
      </a>
    </li>
  );
};

export default DownloadItem;