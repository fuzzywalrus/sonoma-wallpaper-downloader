import React, { useState, useEffect } from 'react';
import DownloadList from './DownloadList';
import ProgressBar from './ProgressBar';
import UpdateNotification from './UpdateNotification';
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

  return (
    <div className="container">
      <div className="app-header">
        <h3>macOS Sonoma Wallpapers</h3>
        <p>Download beautiful video backgrounds for your desktop</p>
      </div>
      
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
      
      <DownloadList assets={assets} />
    </div>
  );
};

export default App;