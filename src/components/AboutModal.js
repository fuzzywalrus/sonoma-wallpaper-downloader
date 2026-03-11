import React from 'react';

const AboutModal = ({ onClose }) => (
  <div className="about-modal-backdrop" onClick={onClose}>
    <div className="about-modal" onClick={(e) => e.stopPropagation()}>
      <img src="/icon.png" alt="Mac Video Wallpaper Manager icon" className="about-icon" />
      <h2 className="about-name">Mac Video Wallpaper Manager</h2>
      <p className="about-version">v1.1.0</p>
      <p className="about-formerly">Formerly: Sonoma Wallpaper Downloader</p>
      <p className="about-credit">
        Created by{' '}
        <a href="https://greggant.com" target="_blank" rel="noopener noreferrer">
          Greg Gant
        </a>
      </p>
      <button type="button" className="about-close" onClick={onClose}>
        Close
      </button>
    </div>
  </div>
);

export default AboutModal;
