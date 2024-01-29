
const downloadProgress = () => {
    ipcRenderer.on('download-progress', (event, receivedBytes, totalBytes) => {
        // Update your UI with the download progress
        const progress = (receivedBytes / totalBytes) * 100;
        console.log(`Download progress: ${progress}%`);
      
        // Optionally, update the progress on the UI
        updateDownloadProgressUI(progress);
        if (receivedBytes === totalBytes) {
            // Trigger fade-out effect when download is complete
            fadeOutProgressBar();
        }
    });
    
    function updateDownloadProgressUI(progress) {
        // Update the UI with the download progress
        // For example, updating a progress bar element
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    function fadeOutProgressBar() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
          progressBar.classList.add('fade-out');
        }
      }

}


  module.exports = downloadProgress;