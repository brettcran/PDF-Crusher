// scripts/app.js

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById('file-input') || document.getElementById('upload-btn');
  const helpBtn = document.getElementById('help-btn');
  const closeHelp = document.getElementById('close-help');
  const toolbar = document.getElementById('toolbar');
  const closeSignature = document.getElementById('close-signature');

  if (fileInput && fileInput.tagName === "INPUT") {
    fileInput.addEventListener('change', handleFileUpload);
  } else if (fileInput && fileInput.tagName === "BUTTON") {
    fileInput.addEventListener('click', triggerFileInput);
  }

  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      document.getElementById('help-modal').style.display = 'flex';
    });
  }

  if (closeHelp) {
    closeHelp.addEventListener('click', () => {
      document.getElementById('help-modal').style.display = 'none';
    });
  }

  if (closeSignature) {
    closeSignature.addEventListener('click', () => {
      document.getElementById('signature-modal').style.display = 'none';
    });
  }

  if (toolbar) {
    toolbar.addEventListener('click', (e) => {
      if (e.target.id) {
        handleToolbarAction(e.target.id);
      }
    });
  }
});

function triggerFileInput() {
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'file';
  hiddenInput.accept = 'application/pdf';
  hiddenInput.style.display = 'none';
  hiddenInput.addEventListener('change', handleFileUpload);
  document.body.appendChild(hiddenInput);
  hiddenInput.click();
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file && file.type === 'application/pdf') {
    const reader = new FileReader();
    reader.onload = (event) => {
      sessionStorage.setItem('pdfData', event.target.result);
      sessionStorage.setItem('pdfName', file.name);
      window.location.href = 'editor.html';
    };
    reader.readAsDataURL(file);
  }
}

function handleToolbarAction(action) {
  switch (action) {
    case "upload-btn":
      triggerFileInput();
      break;
    case "save-btn":
      savePDF();
      break;
    case "text-btn":
      createTextBox();
      break;
    case "sign-btn":
      openSignatureModal();
      break;
    case "undo-btn":
      undo();
      break;
    case "redo-btn":
      redo();
      break;
    case "zoom-in-btn":
      zoomIn();
      break;
    case "zoom-out-btn":
      zoomOut();
      break;
    case "help-btn":
      document.getElementById('help-modal').style.display = 'flex';
      break;
  }
}
