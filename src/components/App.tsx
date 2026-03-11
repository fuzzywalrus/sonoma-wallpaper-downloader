import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import DownloadList from './DownloadList';
import ScreensaverManager from './ScreensaverManager';
import ProgressBar from './ProgressBar';
import UpdateNotification from './UpdateNotification';
import MigrationNotice from './MigrationNotice';
import AboutModal from './AboutModal';
import { fetchAndProcessData } from '../services/dataService';
import { initUpdateListeners, installUpdate } from '../services/updateService';
import type { AppleAsset } from '../types';
import '../App.css';

type Tab = 'download' | 'manage';

const App: React.FC = () => {
  const [assets, setAssets] = useState<AppleAsset[]>([]);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('download');
  const [showAbout, setShowAbout] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 3, width: 0 });
  const prevTabRef = useRef<Tab | null>(null);
  const TABS: Tab[] = ['download', 'manage'];

  useLayoutEffect(() => {
    const btn = tabRefs.current[TABS.indexOf(activeTab)];
    if (btn) setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
    prevTabRef.current = activeTab;
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const slideClass =
    prevTabRef.current === null
      ? ''
      : TABS.indexOf(activeTab) > TABS.indexOf(prevTabRef.current)
        ? 'animate-tab-enter-right'
        : 'animate-tab-enter-left';

  useEffect(() => {
    initUpdateListeners(
      () => setUpdateAvailable(true),
      () => setUpdateDownloaded(true)
    );

    // Listen for the native macOS "About" menu item click.
    if (window.__TAURI_INTERNALS__) {
      import('@tauri-apps/api/event').then(({ listen }) => {
        listen('show-about', () => setShowAbout(true));
      });
    }

    if (window.electron) {
      window.electron.receive('download-progress', (...args: unknown[]) => {
        const [receivedBytes, totalBytes] = args as [number, number];
        setProgress((receivedBytes / totalBytes) * 100);
        setIsDownloading(true);
        if (receivedBytes === totalBytes) {
          setTimeout(() => { setIsDownloading(false); setProgress(0); }, 1500);
        }
      });
    }

    fetchAndProcessData()
      .then((data) => setAssets(data))
      .catch(() => setAssets([]));
  }, []);

  const isElectron = !!window.electron && !window.tauri;

  return (
    <div className="w-full max-w-[1200px] mx-auto p-5">
      {/* Toolbar with tab bar + about button */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-macos-border gap-3">
        <div className="relative inline-flex bg-black/[0.07] rounded-full p-[5px] gap-1" role="tablist">
          {/* Sliding indicator pill */}
          <span
            className="absolute top-[5px] bottom-[5px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.08)] transition-[left,width] duration-200 ease-in-out pointer-events-none"
            style={{ left: indicator.left, width: indicator.width }}
          />
          {(['download', 'manage'] as Tab[]).map((tab, i) => (
            <button
              key={tab}
              ref={(el) => { tabRefs.current[i] = el; }}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`relative z-10 px-5 py-[7px] rounded-full text-[13px] font-medium cursor-pointer whitespace-nowrap border-none bg-transparent transition-colors duration-150 ${
                activeTab === tab ? 'text-macos-text' : 'text-macos-secondary hover:text-macos-text'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'download' ? 'Download Video Wallpapers' : 'Manage Downloaded Video Wallpapers'}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="shrink-0 w-7 h-7 rounded-full border border-macos-border bg-transparent text-macos-secondary text-[15px] flex items-center justify-center cursor-pointer p-0 leading-none transition-all hover:bg-black/[0.06] hover:text-macos-text"
          onClick={() => setShowAbout(true)}
          title="About Mac Video Wallpaper Manager"
        >
          ⓘ
        </button>
      </div>

      {/* Tab content — key forces remount on tab change, triggering the slide animation */}
      <div key={activeTab} className={`overflow-hidden ${slideClass}`}>
        {activeTab === 'download' && (
          <>
            {isElectron && <MigrationNotice />}
            {isDownloading && <ProgressBar progress={progress} />}
            {updateAvailable && (
              <UpdateNotification message="A new update is available. Downloading now…" />
            )}
            {updateDownloaded && (
              <UpdateNotification
                message="A new update has been downloaded. Would you like to restart the app to install the update now?"
                confirmButton
                onConfirm={installUpdate}
              />
            )}
            <DownloadList assets={assets} onPreview={(url, label) => { setPreviewUrl(url); setPreviewLabel(label); }} />
          </>
        )}

        {activeTab === 'manage' && <ScreensaverManager />}
      </div>

      {/* About modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {/* Video preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
          onClick={() => { setPreviewUrl(null); setPreviewLabel(''); }}
        >
          <div
            className="bg-[#111] text-white rounded-xl p-[16px_16px_12px] max-w-[960px] w-[90vw] shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            {previewLabel && <h4 className="m-0 mb-2 text-base font-medium">{previewLabel}</h4>}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video src={previewUrl} controls autoPlay className="w-full max-h-[70vh] rounded-lg bg-black" />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                className="px-[14px] py-[6px] rounded-full border border-white/40 bg-transparent text-white text-xs transition-colors hover:bg-white/[0.08]"
                onClick={() => { setPreviewUrl(null); setPreviewLabel(''); }}
              >
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
