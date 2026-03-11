import React from 'react';

interface Props {
  onClose: () => void;
}

const AboutModal: React.FC<Props> = ({ onClose }) => (
  <div
    className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1100]"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-[14px] p-8 pb-6 w-80 text-center shadow-[0_20px_60px_rgba(0,0,0,0.22),0_0_0_0.5px_rgba(0,0,0,0.08)] animate-slide-in"
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src="/icon.png"
        alt="Mac Video Wallpaper Manager icon"
        className="w-20 h-20 rounded-[18px] mb-3 block mx-auto"
      />
      <h2 className="text-[17px] font-semibold mb-1 mt-0 text-macos-text">
        Mac Video Wallpaper Manager
      </h2>
      <p className="text-[13px] text-macos-secondary mt-0 mb-1">v1.1.0</p>
      <p className="text-xs text-macos-secondary italic mt-0 mb-2">
        Formerly: Sonoma Wallpaper Downloader
      </p>
      <p className="text-[13px] text-macos-secondary mt-0 mb-5">
        Created by{' '}
        <a
          href="https://greggant.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-macos-accent no-underline hover:underline"
        >
          Greg Gant
        </a>
      </p>
      <button
        type="button"
        className="px-6 py-[7px] rounded-full border border-macos-border bg-macos-bg text-[13px] font-medium text-macos-text cursor-pointer transition-colors hover:bg-[#ebebed]"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);

export default AboutModal;
