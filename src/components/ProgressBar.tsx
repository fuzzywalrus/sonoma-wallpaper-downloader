import React, { useEffect, useState } from 'react';

interface Props {
  progress: number;
}

const ProgressBar: React.FC<Props> = ({ progress }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setFadeOut(true), 500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <div className="relative my-3 mb-5">
      <div
        className={`h-[6px] bg-macos-accent rounded-[3px] [transition:width_0.3s_ease,opacity_0.5s_ease-out] ${fadeOut ? 'opacity-0' : ''}`}
        style={{ width: `${progress}%` }}
      />
      {!fadeOut && (
        <div className="text-xs text-macos-secondary mt-[6px] text-center">
          Downloading… {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
