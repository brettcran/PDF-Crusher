// === app.js ===

// Initialize pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

// DOM Elements
const uploadBtn = document.getElementById('upload-btn');
const helpBtn = document.getElementById('help-btn');
const closeHelp = document.getElementById('close-help');
const pdfContainer = document.getElementById('pdf-container');
const toolbar = document.getElementById('toolbar');
const miniTextToolbar = document.getElementById('mini-text-toolbar');
const fontSelect = document.getElementById('font-select');
const fontSizeSelect = document.getElementById('font-size-select');
const colorPicker = document.getElementById('color-picker');
const boldToggle = document.getElementById('bold-toggle');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  if (uploadBtn) {
    uploadBtn.addEventListener('click', triggerFileSelect);
    setupLanding();
  }
  if (toolbar) {
    setupEditor();
  }
});

// === Landing Page Functions ===
function setupLanding() {
  loadRecentFiles();
  document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('help-modal').style.display = 'flex';
  });
  document.getElementById('close-help').addEventListener('click', () => {
    document.getElementById('help-modal').style.display = 'none';
  });
}

function triggerFileSelect() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/pdf';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        sessionStorage.setItem('uploadedPDF', event.target.result);
        saveRecentFile(file.name, event.target.result);
        window.location.href = 'editor.html';
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

function loadRecentFiles() {
  const recent = JSON.parse(localStorage.getItem('recentFiles')) || [];
  const container = document.getElementById('recent-files');
  container.innerHTML = '';
  recent.forEach((file, index) => {
    const btn = document.createElement('button');
    btn.className = 'upload-btn';
    btn.textContent = file.name;
    btn.onclick = () => {
      sessionStorage.setItem('uploadedPDF', file.data);
      window.location.href = 'editor.html';
    };
    container.appendChild(btn);
  });
}

function saveRecentFile(name, data) {
  let recent = JSON.parse(localStorage.getItem('recentFiles')) || [];
  recent.unshift({ name, data });
  if (recent.length > 5) recent = recent.slice(0, 5);
  localStorage.setItem('recentFiles', JSON.stringify(recent));
}

// === Editor Page Functions ===
function setupEditor() {
  const savedPDF = sessionStorage.getItem('uploadedPDF');
  if (savedPDF) {
    loadPDF(savedPDF);
  }

  toolbar.addEventListener('click', handleToolbarAction);
  document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('help-modal').style.display = 'flex';
  });
  document.getElementById('close-help').addEventListener('click', () => {
    document.getElementById('help-modal').style.display = 'none';
  });

  setupMiniTextToolbar();
}

function handleToolbarAction(e) {
  const action = e.target.closest('button')?.dataset?.action;
  if (!action) return;

  switch(action) {
    case 'text':
      createTextBox();
      break;
    case 'sign':
      openSignatureModal();
      break;
    case 'save':
      savePDF();
      break;
    case 'zoom-in':
      zoomIn();
      break;
    case 'zoom-out':
      zoomOut();
      break;
    case 'help':
      document.getElementById('help-modal').style.display = 'flex';
      break;
  }
}
