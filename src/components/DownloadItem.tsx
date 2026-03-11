import React from 'react';
import { downloadFile } from '../services/downloadService';

interface Props {
  label: string;
  url: string;
  previewImage: string;
  onPreview: (url: string, label: string) => void;
}

const DownloadItem: React.FC<Props> = ({ label, url, previewImage, onPreview }) => {
  if (!label || !url || !previewImage) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const filename =
      label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.mp4';
    downloadFile(url, filename);
  };

  return (
    <li className="bg-white rounded-lg overflow-hidden shadow-sm border border-macos-border transition-all hover:-translate-y-1 hover:shadow-md">
      {/* CSS-only hover overlay via group */}
      <a href={url} onClick={handleDownload} className="flex flex-col text-macos-text no-underline h-full group">
        <div className="relative overflow-hidden">
          <img src={previewImage} alt={label} className="w-full aspect-video object-cover border-b border-macos-border" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Download button */}
            <button
              type="button"
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/60 bg-black/35 cursor-pointer transition-all hover:bg-black/60 hover:-translate-y-px hover:shadow-md"
              onClick={handleDownload}
              aria-label="Download video"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            {/* Preview button */}
            <button
              type="button"
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/60 bg-black/35 cursor-pointer transition-all hover:bg-black/60 hover:-translate-y-px hover:shadow-md"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPreview(url, label); }}
              aria-label="Preview video"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          </div>
        </div>
        <span className="px-3 py-3 text-sm text-center font-medium overflow-hidden text-ellipsis whitespace-nowrap">
          {label}
        </span>
      </a>
    </li>
  );
};

export default DownloadItem;
