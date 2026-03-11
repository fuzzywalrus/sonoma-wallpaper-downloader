import React, { useState, useEffect } from 'react';
import DownloadList from './DownloadList';
import ScreensaverManager from './ScreensaverManager';
import ProgressBar from './ProgressBar';
import UpdateNotification from './UpdateNotification';
import MigrationNotice from './MigrationNotice';
import AboutModal from './AboutModal';
import { fetchAndProcessData } from '../services/dataService';
import { initUpdateListeners, installUpdate } from '../services/updateService';
import '../App.css';

const App = () => {
  const [assets, setAssets] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [activeTab, setActiveTab] = useState('download');
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    initUpdateListeners(
      () => setUpdateAvailable(true),
      () => setUpdateDownloaded(true)
    );

    if (window.electron) {
      window.electron.receive('download-progress', (receivedBytes, totalBytes) => {
        const calculatedProgress = (receivedBytes / totalBytes) * 100;
        setProgress(calculatedProgress);
        setIsDownloading(true);

        if (receivedBytes === totalBytes) {
          setTimeout(() => {
            setIsDownloading(false);
            setProgress(0);
          }, 1500);
        }
      });
    }

    const loadData = async () => {
      try {
        const processedAssets = await fetchAndProcessData();
        if (processedAssets && Array.isArray(processedAssets)) {
          setAssets(processedAssets);
        } else {
          setAssets([]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setAssets([]);
      }
    };

    loadData();
  }, []);

  const handleRestartApp = () => {
    installUpdate();
  };

  const handleOpenPreview = (url, label) => {
    setPreviewUrl(url);
    setPreviewLabel(label || '');
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
    setPreviewLabel('');
  };

  const isElectron = window.electron && !window.tauri;

  return (
    <div className="container">
      <div className="app-toolbar">
        <div className="tab-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'download'}
            className={activeTab === 'download' ? 'active' : ''}
            onClick={() => setActiveTab('download')}
          >
            Download Video Wallpapers
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'manage'}
            className={activeTab === 'manage' ? 'active' : ''}
            onClick={() => setActiveTab('manage')}
          >
            Manage Downloaded Video Wallpapers
          </button>
        </div>
        <button
          type="button"
          className="about-btn"
          onClick={() => setShowAbout(true)}
          title="About Mac Video Wallpaper Manager"
        >
          ⓘ
        </button>
      </div>

      {activeTab === 'download' && (
        <>
          {isElectron && <MigrationNotice />}

          {isDownloading && <ProgressBar progress={progress} />}

          {updateAvailable && (
            <UpdateNotification
              message="A new update is available. Downloading now..."
            />
          )}

          {updateDownloaded && (
            <UpdateNotification
              message="A new update has been downloaded. Would you like to restart the app to install the update now?"
              confirmButton={true}
              onConfirm={handleRestartApp}
            />
          )}

          <DownloadList assets={assets} onPreview={handleOpenPreview} />
        </>
      )}

      {activeTab === 'manage' && <ScreensaverManager />}

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {previewUrl && (
        <div className="preview-modal-backdrop" onClick={handleClosePreview}>
          <div
            className="preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {previewLabel && <h4>{previewLabel}</h4>}
            <video src={previewUrl} controls autoPlay />
            <div className="preview-actions">
              <button type="button" onClick={handleClosePreview}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
