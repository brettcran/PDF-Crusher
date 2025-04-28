// === app.js ===
// Main App Controller

document.addEventListener('DOMContentLoaded', () => {
  const isLandingPage = document.getElementById('landing-main') !== null;

  if (isLandingPage) {
    setupLandingPage();
  } else {
    setupEditorPage();
  }
});

// === Landing Page Logic ===
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
        updateRecentFiles(file.name, event.target.result);
        window.location.href = 'editor.html';
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

function updateRecentFiles(filename, data) {
  let files = JSON.parse(localStorage.getItem('recentFiles')) || [];
  files.unshift({ name: filename, data: data });
  files = files.slice(0, 5);
  localStorage.setItem('recentFiles', JSON.stringify(files));
}

function loadRecentFiles() {
  const list = document.getElementById('recent-list');
  if (!list) return;

  list.innerHTML = '';
  const files = JSON.parse(localStorage.getItem('recentFiles')) || [];

  files.forEach(file => {
    const li = document.createElement('li');
    li.textContent = file.name;
    li.addEventListener('click', () => {
      sessionStorage.setItem('uploadedPDF', file.data);
      window.location.href = 'editor.html';
    });
    list.appendChild(li);
  });
}

function toggleHelpModal(show) {
  const modal = document.getElementById('help-modal');
  if (modal) {
    modal.style.display = show ? 'block' : 'none';
  }
}

// === Editor Page Logic ===
function setupEditorPage() {
  bindToolbarActions();
  loadStoredOrPromptFile();
  bindHelpModal();
}

function bindToolbarActions() {
  document.querySelectorAll('.toolbar-btn').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('aria-label');
      handleToolbarAction(action);
    });
  });
}

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

function bindHelpModal() {
  const helpBtn = document.getElementById('help-btn');
  const closeHelp = document.getElementById('close-help');
  const modal = document.getElementById('help-modal');

  if (helpBtn && closeHelp && modal) {
    helpBtn.addEventListener('click', () => toggleHelpModal(true));
    closeHelp.addEventListener('click', () => toggleHelpModal(false));
  }
}

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
    document.getElementById('file-input').click();
  }
}
