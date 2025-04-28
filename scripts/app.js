// scripts/app.js

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById('file-input');
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeHelp = document.getElementById('close-help');
  const toolbar = document.getElementById('toolbar');

  // Landing page logic
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }
  if (helpBtn) {
    helpBtn.addEventListener('click', () => helpModal.style.display = 'flex');
  }
  if (closeHelp) {
    closeHelp.addEventListener('click', () => helpModal.style.display = 'none');
  }

  // Editor toolbar logic
  if (toolbar) {
    toolbar.addEventListener('click', (e) => {
      if (e.target.classList.contains('toolbar-btn')) {
        handleToolbarAction(e.target.dataset.action);
      }
    });
  }
});

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file && file.type === 'application/pdf') {
    const reader = new FileReader();
    reader.onload = (event) => {
      sessionStorage.setItem('pdfData', event.target.result);
      sessionStorage.setItem('pdfName', file.name); // ✅ Save the original filename
      window.location.href = 'editor.html';
    };
    reader.readAsDataURL(file);
  }
}

function handleToolbarAction(action) {
  switch (action) {
    case "upload":
      document.getElementById('file-input').click();
      break;
    case "save":
      savePDF();
      break;
    case "text":
      createTextBox();
      break;
    case "signature":
      openSignatureModal();
      break;
    case "undo":
      undo();
      break;
    case "redo":
      redo();
      break;
    case "zoomIn":
      zoomIn();
      break;
    case "zoomOut":
      zoomOut();
      break;
  }
}
