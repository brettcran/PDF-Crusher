// === app.js ===
// Main Entry Point Script

document.addEventListener('DOMContentLoaded', () => {
  const isLandingPage = document.getElementById('landing-main') !== null;

  if (isLandingPage) {
    setupLandingPage();
  } else {
    setupEditorPage();
  }
});

// Landing Page Setup
function setupLandingPage() {
  loadRecentFiles();

  document.getElementById('open-file-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });

  document.getElementById('file-input').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = function(event) {
        sessionStorage.setItem('uploadedPDF', event.target.result);
        localStorage.setItem('currentFile', file.name);
        updateRecentFiles(file.name);
        window.location.href = 'editor.html';
      };

      reader.onerror = function() {
        alert('Error reading file.');
      };

      reader.readAsDataURL(file);
    }
  });

  document.getElementById('help-btn').addEventListener('click', () => {
    toggleHelpModal(true);
  });

  document.getElementById('close-help').addEventListener('click', () => {
    toggleHelpModal(false);
  });
}

// Editor Page Setup
function setupEditorPage() {
  bindToolbarActions();
  loadStoredOrPromptFile();
  bindHelpModal();
}

// Help Modal Toggle
function toggleHelpModal(show) {
  const modal = document.getElementById('help-modal');
  if (modal) {
    modal.style.display = show ? 'block' : 'none';
  }
}

// Bind Toolbar Button Actions
function bindToolbarActions() {
  document.querySelectorAll('.toolbar-btn').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('aria-label');
      handleToolbarAction(action);
    });
  });
}

// Help Modal on Editor
function bindHelpModal() {
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-modal');
  const closeHelp = document.getElementById('close-help');

  if (helpBtn && helpModal && closeHelp) {
    helpBtn.addEventListener('click', () => toggleHelpModal(true));
    closeHelp.addEventListener('click', () => toggleHelpModal(false));
  }
}

// Handle Toolbar Actions
function handleToolbarAction(action) {
  switch (action) {
    case 'Upload PDF':
      document.getElementById('file-input').click();
      break;
    case 'Save PDF':
      savePDF();
      break;
    case 'Add Text':
      createTextBox();
      break;
    case 'Add Signature':
      openSignatureModal();
      break;
    case 'Undo':
      undo();
      break;
    case 'Redo':
      redo();
      break;
    case 'Zoom In':
      zoomIn();
      break;
    case 'Zoom Out':
      zoomOut();
      break;
    case 'Help':
      toggleHelpModal(true);
      break;
  }
}

// Load Stored File from sessionStorage or fallback
function loadStoredOrPromptFile() {
  const base64Data = sessionStorage.getItem('uploadedPDF');

  if (base64Data) {
    fetch(base64Data)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        pdfjsLib.getDocument(new Uint8Array(buffer)).promise.then((pdfDoc_) => {
          pdfDoc = pdfDoc_;
          renderAllPages();
        });
      })
      .catch(() => {
        alert('Failed to load PDF.');
      });
  } else {
    document.getElementById('file-input').click(); // fallback
  }
}
