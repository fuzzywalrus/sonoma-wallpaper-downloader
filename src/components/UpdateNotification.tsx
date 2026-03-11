import React from 'react';

interface Props {
  message: string;
  confirmButton?: boolean;
  onConfirm?: () => void;
}

const UpdateNotification: React.FC<Props> = ({ message, confirmButton = false, onConfirm }) => (
  <div className="bg-white rounded-lg p-4 my-5 shadow-md border border-macos-border animate-slide-in">
    <div className="flex items-center mb-[10px]">
      <svg
        className="text-macos-accent mr-2 shrink-0"
        width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span className="font-semibold text-[15px]">Software Update</span>
    </div>
    <p className="mb-[14px] text-macos-text text-sm">{message}</p>
    {confirmButton && (
      <div className="flex gap-[10px] justify-end">
        <button
          type="button"
          className="px-3 py-[6px] rounded-md text-[13px] font-medium text-macos-text bg-black/5 hover:bg-black/10 transition-colors"
        >
          Later
        </button>
        <button
          type="button"
          className="px-3 py-[6px] rounded-md text-[13px] font-medium bg-macos-accent text-white hover:bg-macos-accent-hover transition-colors"
          onClick={onConfirm}
        >
          Restart Now
        </button>
      </div>
    )}
  </div>
);

export default UpdateNotification;
