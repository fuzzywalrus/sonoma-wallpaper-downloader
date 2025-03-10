import React from 'react';
import DownloadItem from './DownloadItem';

const DownloadList = ({ assets }) => {
  console.log('DownloadList: Rendering with assets:', assets);
  if (!assets || assets.length === 0) {
    return <h5>No entries available</h5>;
  }

  return (
    <ul className="download-list">
      {assets.map((asset, index) => (
        <DownloadItem 
          key={index} 
          label={asset.newLabel || asset.accessibilityLabel}
          url={asset['url-4K-SDR-240FPS']}
          previewImage={asset.previewImage}
        />
      ))}
    </ul>
  );
};

export default DownloadList;