import React from 'react';
import { downloadFile } from '../services/downloadService';

const DownloadItem = ({ label, url, previewImage }) => {
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
      <a href={url} onClick={handleDownload}>
        <img src={previewImage} alt={label} />
        <span>{label}</span>
      </a>
    </li>
  );
};

export default DownloadItem;
