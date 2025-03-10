import React, { useEffect, useState } from 'react';

const ProgressBar = ({ progress }) => {
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setFadeOut(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <div className="progress-container">
      <div 
        className={`progress-bar ${fadeOut ? 'fade-out' : ''}`}
        style={{ width: `${progress}%` }}
      />
      {!fadeOut && (
        <div className="progress-text">
          Downloading... {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;