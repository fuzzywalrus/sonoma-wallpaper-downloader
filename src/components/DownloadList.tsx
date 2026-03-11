import React from 'react';
import DownloadItem from './DownloadItem';
import type { AppleAsset } from '../types';

interface Props {
  assets: AppleAsset[];
  onPreview: (url: string, label: string) => void;
}

const DownloadList: React.FC<Props> = ({ assets, onPreview }) => {
  if (!assets || assets.length === 0) {
    return <h5 className="text-macos-secondary font-normal">No entries available</h5>;
  }

  return (
    <ul className="grid [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))] gap-5 list-none p-0 my-6">
      {assets.map((asset, index) => (
        <DownloadItem
          key={index}
          label={asset.newLabel ?? asset.accessibilityLabel ?? ''}
          url={asset['url-4K-SDR-240FPS'] ?? ''}
          previewImage={asset.previewImage ?? ''}
          onPreview={onPreview}
        />
      ))}
    </ul>
  );
};

export default DownloadList;
