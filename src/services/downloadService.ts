export const downloadFile = async (url: string, filename = ''): Promise<boolean> => {
  try {
    if (window.electron || window.tauri) {
      window.location.href = url;
      return true;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    if (filename) {
      link.download = filename;
    } else {
      const disposition = response.headers.get('content-disposition');
      const match = disposition?.match(/filename="(.+)"/);
      link.download = match?.[1] ?? url.split('/').at(-1) ?? 'download';
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    return true;
  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
};

export class DownloadManager {
  private activeDownloads = new Map<string, { url: string; filename: string }>();

  startDownload(url: string, filename = ''): string {
    const id = `dl_${Date.now()}`;
    this.activeDownloads.set(id, { url, filename });
    downloadFile(url, filename).finally(() => this.activeDownloads.delete(id));
    return id;
  }

  getActiveDownloads() {
    return this.activeDownloads;
  }
}

export const downloadManager = new DownloadManager();
