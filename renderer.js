console.log('Renderer process is running');
const { ipcRenderer, remote } = require('electron');
const { dialog } = remote;

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const transcriptionOutput = document.getElementById('transcriptionOutput');

  // Click event for the "UPLOAD MP3 OR MP4 FILE" button
  document.querySelector('button').addEventListener('click', () => {
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Audio Files', extensions: ['mp3', 'mp4'] }
      ]
    }).then(result => {
      if (!result.canceled) {
        const filePath = result.filePaths[0];
        console.log('File selected:', filePath);
        ipcRenderer.send('file-uploaded', filePath);
      }
    }).catch(err => {
      console.error('Error selecting file:', err);
    });
  });

  // File input change event
  fileInput.addEventListener('change', (e) => {
    console.log('File input changed');
    handleFiles(e.target.files);
  });

  // Drag and drop events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
    console.log('File dropped');
    handleFiles(e.dataTransfer.files);
  });

  // Function to handle the selected or dropped files
  function handleFiles(files) {
    console.log('Handling files');
    for (const file of files) {
      console.log(`File detected: ${file.name}`);
      // Check if the file is an MP3 or MP4
      const validFileTypes = ['audio/mpeg', 'video/mp4'];
      const validExtensions = ['.mp3', '.mp4'];

      const fileExtension = file.name.toLowerCase().slice(-4);
      const isValidFile = validFileTypes.includes(file.type) || validExtensions.includes(fileExtension);

      if (isValidFile) {
        console.log('Valid MP3 or MP4 file:', file.name);

        // Send the file path to the main process
        ipcRenderer.send('file-uploaded', file.path);
      } else {
        console.log('Invalid file type. Please upload an MP3 or MP4 file.');
        alert('Please upload only MP3 or MP4 files.');
      }
    }
  }

  // Listen for the response from the main process
  ipcRenderer.on('file-saved', (event, savedFilePath) => {
    console.log('File saved at:', savedFilePath);
    alert(`File saved successfully at ${savedFilePath}`);
  });

  ipcRenderer.on('transcription-complete', (event, transcription) => {
    console.log('Transcription complete:', transcription);
    transcriptionOutput.textContent = transcription;
  });

  ipcRenderer.on('file-save-error', (event, errorMessage) => {
    console.error('File save error:', errorMessage);
    alert(errorMessage);
  });

  ipcRenderer.on('transcription-error', (event, errorMessage) => {
    console.error('Transcription error:', errorMessage);
    alert('Error during transcription. Please try again.');
  });
});
