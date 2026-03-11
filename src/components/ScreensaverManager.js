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
    const file = files.find((f) => f.path === path);
    const name = file?.name || path;

    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm(`Delete “${name}”? This removes the downloaded video from disk.`)) {
      return;
    }

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
        <h4>Manage downloaded screensavers</h4>
        <p>
          Showing videos from{' '}
          <code>/Library/Application Support/com.apple.idleassetsd/Customer/</code>
        </p>
        <div className="screensaver-meta">
          <span>{files.length} file{files.length === 1 ? '' : 's'}</span>
          <span>Total size: {formatSize(totalBytes)}</span>
          <button type="button" onClick={load} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="screensaver-error">
          <p>{error}</p>
          <button type="button" onClick={openFullDiskAccessSettings}>
            Open Full Disk Access settings
          </button>
        </div>
      )}

      {!loading && files.length === 0 && !error && (
        <p className="screensaver-empty">
          No downloaded screensaver videos were found in the Customer folder.
        </p>
      )}

      {files.length > 0 && (
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
                <td>{file.name}</td>
                <td>{file.folder}</td>
                <td>{formatSize(file.sizeBytes)}</td>
                <td className="screensaver-actions">
                  <button
                    type="button"
                    onClick={() => handleDelete(file.path)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ScreensaverManager;

