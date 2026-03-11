import React, { useEffect, useRef, useState } from 'react';
import {
  listScreensavers,
  deleteScreensaver,
  openFullDiskAccessSettings,
} from '../services/screensaverService';
import type { ScreensaverFile } from '../types';

const formatSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'] as const;
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
};

const STEPS = [
  <>Open <strong>System Settings → Privacy &amp; Security → Full Disk Access</strong>.</>,
  <>Click the <strong>+</strong> button at the bottom of the list.</>,
  <>Navigate to <strong>/Applications</strong> and select <strong>Mac Video Wallpaper Manager</strong>.</>,
  <>Enable the toggle next to the app.</>,
  <>Quit and relaunch the app, then try removing the file again. macOS will prompt for your password to confirm the deletion.</>,
];

const PermissionsGuide: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  return (
    <div className="mt-3 rounded-xl border border-[#ff3b30]/25 bg-[#ff3b30]/[0.04] overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-[#ff3b30]/15">
        <div>
          <p className="m-0 text-[14px] font-[600] text-[#ad1d13]">Full Disk Access Required</p>
          <p className="m-0 mt-[3px] text-[13px] text-[#ad1d13]/75">
            macOS protects this folder — the app needs Full Disk Access to delete files from it.
            Follow the steps below to grant access.
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs px-3 py-[6px] rounded-full border border-[#ff3b30]/35 bg-white/60 text-[#ad1d13] font-[550] whitespace-nowrap transition-colors hover:bg-white/90"
          onClick={openFullDiskAccessSettings}
        >
          Open Full Disk Access →
        </button>
      </div>

      <div className="flex gap-4 p-4">
        {/* Video */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          src="permissions.mov"
          autoPlay
          muted
          playsInline
          className="shrink-0 w-[260px] rounded-lg border border-[#ff3b30]/15 bg-black cursor-pointer shadow-sm"
          title="Click to replay"
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play();
            }
          }}
          onEnded={() => {
            // pause on last frame — click to replay
          }}
        />

        {/* Steps */}
        <ol className="m-0 p-0 list-none flex flex-col gap-[10px]">
          {STEPS.map((step, i) => (
            <li key={i} className="flex items-start gap-[10px]">
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#ff3b30]/[0.12] border border-[#ff3b30]/25 text-[11px] font-[650] text-[#ad1d13] flex items-center justify-center mt-px">
                {i + 1}
              </span>
              <span className="text-[13px] text-[#3a3a3d] leading-[1.45]">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

const ScreensaverManager: React.FC = () => {
  const [files, setFiles] = useState<ScreensaverFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmingPath, setConfirmingPath] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setFiles(await listScreensavers());
    } catch (e) {
      console.error('Failed to list screensavers', e);
      setError('Unable to read Customer screensavers. You may need to grant disk access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (path: string) => {
    setConfirmingPath(null);
    try {
      const ok = await deleteScreensaver(path);
      if (ok) {
        setFiles((prev) => prev.filter((f) => f.path !== path));
      } else {
        setError('Failed to delete file. Check permissions and try again.');
      }
    } catch (e) {
      console.error('Delete failed', e);
      setError('Failed to delete file. Check permissions and try again.');
    }
  };

  const totalBytes = files.reduce((sum, f) => sum + (f.sizeBytes || 0), 0);

  return (
    <div className="mt-[6px] p-4 rounded-xl border border-[#d8d8de] bg-white/[0.78] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_6px_16px_rgba(0,0,0,0.06)] [backdrop-filter:saturate(140%)_blur(14px)]">

      {/* Header */}
      <div className="flex justify-between items-start gap-3 pb-[10px] border-b border-[#e4e4ea]">
        <div>
          <h4 className="m-0 text-[32px] leading-[1.15] font-[650] tracking-[-0.03em]">
            Manage Downloaded Screensavers
          </h4>
          <p className="mt-2 mb-0 text-[13px] text-[#6e6e73]">
            Showing videos from{' '}
            <code className="font-mono inline-block px-[6px] py-px rounded-[6px] bg-[#f3f3f7] border border-[#e1e1e8] text-[#5d5d63] text-[12px]">
              /Library/Application Support/com.apple.idleassetsd/Customer/
            </code>
          </p>
        </div>
        <button
          type="button"
          className="border border-[#c8c8cf] rounded-lg px-3 py-[6px] min-h-[30px] text-xs font-[560] text-[#1f1f23] bg-gradient-to-b from-white to-[#f0f0f3] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] disabled:opacity-55 disabled:cursor-default transition-colors shrink-0"
          onClick={load}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Meta chips */}
      <div className="mt-3 flex gap-2 flex-wrap" aria-live="polite">
        <span className="inline-flex items-center px-[10px] py-1 rounded-full border border-[#d7d7dd] bg-[#f8f8fb] text-xs font-[550] text-[#494950]">
          {files.length} file{files.length === 1 ? '' : 's'}
        </span>
        <span className="inline-flex items-center px-[10px] py-1 rounded-full border border-[#d7d7dd] bg-[#f8f8fb] text-xs font-[550] text-[#494950]">
          Total size {formatSize(totalBytes)}
        </span>
      </div>

      {/* Permissions guide — shown on any error */}
      {error && <PermissionsGuide />}

      {/* Empty state */}
      {!loading && files.length === 0 && !error && (
        <p className="mt-3 px-3 py-[14px] rounded-lg border border-dashed border-[#d4d4dc] bg-[#fafafd] text-[13px] text-[#696971]">
          No downloaded screensaver videos were found in the Customer folder.
        </p>
      )}

      {/* File table */}
      {files.length > 0 && (
        <div className="mt-3 border border-[#d9d9e1] rounded-[10px] overflow-auto bg-white">
          <table className="w-full min-w-[680px] border-collapse [table-layout:fixed]">
            <thead>
              <tr className="bg-[#f7f7fa]">
                <th className="p-[10px_12px] text-left text-[11px] font-[650] tracking-[0.02em] text-[#66666d] border-b border-[#e1e1e8] uppercase">Name</th>
                <th className="p-[10px_12px] text-left text-[11px] font-[650] tracking-[0.02em] text-[#66666d] border-b border-[#e1e1e8] uppercase">Folder</th>
                <th className="p-[10px_12px] text-left text-[11px] font-[650] tracking-[0.02em] text-[#66666d] border-b border-[#e1e1e8] uppercase">Size</th>
                <th className="border-b border-[#e1e1e8] w-[200px]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ededf3]">
              {files.map((file) => (
                <tr key={file.path} className="hover:bg-[#0071e3]/[0.06] transition-colors">
                  <td className="p-[10px_12px] text-[13px] text-macos-text align-middle" title={file.name}>
                    <span className="block overflow-hidden whitespace-nowrap text-ellipsis">{file.name}</span>
                  </td>
                  <td className="p-[10px_12px] text-[13px] text-macos-text align-middle" title={file.folder}>
                    <span className="block overflow-hidden whitespace-nowrap text-ellipsis">{file.folder}</span>
                  </td>
                  <td className="p-[10px_12px] text-[13px] text-[#55555b] whitespace-nowrap align-middle">
                    {formatSize(file.sizeBytes)}
                  </td>
                  <td className="p-[10px_12px] text-right w-[200px] align-middle">
                    {confirmingPath === file.path ? (
                      <div className="flex items-center justify-end gap-[6px]">
                        <span className="text-xs text-macos-secondary whitespace-nowrap">Delete this file?</span>
                        <button
                          type="button"
                          className="px-[10px] py-1 rounded-full border border-macos-border bg-macos-bg text-xs font-medium text-macos-text cursor-pointer whitespace-nowrap transition-colors hover:bg-[#ebebed]"
                          onClick={() => setConfirmingPath(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="px-[10px] py-1 rounded-full border border-[#ff3b30]/40 bg-[#ff3b30]/[0.1] text-xs font-[560] text-[#d02d22] cursor-pointer whitespace-nowrap transition-colors hover:bg-[#ff3b30]/[0.18]"
                          onClick={() => handleDelete(file.path)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="border border-[#ff3b30]/35 rounded-full px-3 py-[5px] text-xs font-[560] text-[#d02d22] bg-[#ff3b30]/[0.08] transition-colors hover:bg-[#ff3b30]/[0.14]"
                        onClick={() => setConfirmingPath(file.path)}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScreensaverManager;
