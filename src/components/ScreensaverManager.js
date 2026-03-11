import React, { useEffect, useState } from 'react';
import {
  listScreensavers,
  deleteScreensaver,
  openFullDiskAccessSettings,
} from '../services/screensaverService';

const ScreensaverManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmingPath, setConfirmingPath] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listScreensavers();
      setFiles(result || []);
    } catch (e) {
      console.error('Failed to list screensavers', e);
      setError('Unable to read Customer screensavers. You may need to grant disk access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (path) => {
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

  const formatSize = (bytes) => {
    if (!bytes || bytes <= 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let value = bytes;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i += 1;
    }
    return `${value.toFixed(1)} ${units[i]}`;
  };

  return (
    <div className="screensaver-manager">
      <div className="screensaver-header">
        <div className="screensaver-title">
          <h4>Manage Downloaded Screensavers</h4>
          <p>
            Showing videos from{' '}
            <code>/Library/Application Support/com.apple.idleassetsd/Customer/</code>
          </p>
        </div>
        <button
          type="button"
          className="screensaver-refresh"
          onClick={load}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="screensaver-meta" aria-live="polite">
        <span className="screensaver-chip">
          {files.length} file{files.length === 1 ? '' : 's'}
        </span>
        <span className="screensaver-chip">Total size {formatSize(totalBytes)}</span>
      </div>

      {error && (
        <div className="screensaver-error">
          <p>{error}</p>
          <button type="button" onClick={openFullDiskAccessSettings}>
            Open Full Disk Access
          </button>
        </div>
      )}

      {!loading && files.length === 0 && !error && (
        <p className="screensaver-empty">
          No downloaded screensaver videos were found in the Customer folder.
        </p>
      )}

      {files.length > 0 && (
        <div className="screensaver-table-wrap">
          <table className="screensaver-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Folder</th>
                <th>Size</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.path}>
                  <td className="screensaver-name" title={file.name}>
                    <span>{file.name}</span>
                  </td>
                  <td className="screensaver-folder" title={file.folder}>
                    <span>{file.folder}</span>
                  </td>
                  <td className="screensaver-size">{formatSize(file.sizeBytes)}</td>
                  <td className="screensaver-actions">
                    {confirmingPath === file.path ? (
                      <div className="screensaver-confirm">
                        <span className="screensaver-confirm-text">Delete this file?</span>
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => setConfirmingPath(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-delete-confirm"
                          onClick={() => handleDelete(file.path)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="screensaver-delete"
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
