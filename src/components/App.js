import React, { useState, useEffect } from 'react';
import DownloadList from './DownloadList';
import ScreensaverManager from './ScreensaverManager';
import ProgressBar from './ProgressBar';
import UpdateNotification from './UpdateNotification';
import MigrationNotice from './MigrationNotice';
// Make sure this import matches the export in dataService.js
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
  const [mode, setMode] = useState(null); // null | 'download' | 'manage'

  useEffect(() => {
    // Initialize update listeners
    initUpdateListeners(
      // Update available callback
      () => setUpdateAvailable(true),
      // Update downloaded callback
      () => setUpdateDownloaded(true)
    );

    // Listen for download progress
    if (window.electron) {
      window.electron.receive('download-progress', (receivedBytes, totalBytes) => {
        const calculatedProgress = (receivedBytes / totalBytes) * 100;
        setProgress(calculatedProgress);
        setIsDownloading(true);
        
        if (receivedBytes === totalBytes) {
          // Set a timeout to hide the progress bar after download completes
          setTimeout(() => {
            setIsDownloading(false);
            setProgress(0);
          }, 1500);
        }
      });
    }

    // Fetch data on component mount
    const loadData = async () => {
      try {
        const processedAssets = await fetchAndProcessData();
        if (processedAssets && Array.isArray(processedAssets)) {
          setAssets(processedAssets);
        } else {
          console.warn('Processed assets is not a valid array:', processedAssets);
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

  // Check if running on Electron (migration notice only for Electron users)
  const isElectron = window.electron && !window.tauri;

  const showDownloadMode = mode === 'download';
  const showManageMode = mode === 'manage';

  const renderHeader = () => (
    <div className="app-header">
      <h3>macOS Sonoma Wallpapers</h3>
      <p>Download beautiful video backgrounds for your desktop</p>
      <p className="app-about">
        macOS Video Downloader v1.0.5 | Created by{' '}
        <a href="https://greggant.com" target="_blank" rel="noopener noreferrer">
          Greg Gant
        </a>
      </p>
    </div>
  );

  const renderStartup = () => (
    <div className="startup-screen">
      {renderHeader()}
      <div className="startup-actions">
        <button
          type="button"
          className="primary"
          onClick={() => setMode('manage')}
        >
          Manage downloaded screensavers
        </button>
        <button
          type="button"
          onClick={() => setMode('download')}
        >
          Download screensavers
        </button>
      </div>
    </div>
  );

  return (
    <div className="container">
      {mode === null && renderStartup()}

      {showDownloadMode && (
        <>
          {renderHeader()}

          {/* Show migration notice only for Electron users */}
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

          <div className="mode-toggle">
            <button type="button" onClick={() => setMode('manage')}>
              Manage downloaded screensavers
            </button>
          </div>

          <DownloadList assets={assets} onPreview={handleOpenPreview} />
        </>
      )}

      {showManageMode && (
        <>
          {renderHeader()}
          <div className="mode-toggle">
            <button type="button" onClick={() => setMode('download')}>
              Back to downloads
            </button>
          </div>
          <ScreensaverManager />
        </>
      )}

      {previewUrl && (
        <div className="preview-modal-backdrop" onClick={handleClosePreview}>
          <div
            className="preview-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
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