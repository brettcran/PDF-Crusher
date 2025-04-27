// === FINAL FIXED app.js (Landing + Editor Smart) ===

let pdfDoc = null;
let scale = 1.5;
let uploadedFileName = "filled-pdf";
let elements = [];
let undoStack = [];
let lastClick = { x: 150, y: 200 };

// Detect page
const isLandingPage = document.getElementById('landing-main') !== null;

// Only setup PDF.js if NOT Landing page
if (!isLandingPage) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
}

// === Landing Page Logic ===
if (isLandingPage) {
  loadRecentFiles();

  document.getElementById('open-file-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });

  document.getElementById('file-input').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      localStorage.setItem('currentFile', file.name);
      window.location.href = 'editor.html';
    }
  });

  document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('help-modal').style.display = 'block';
  });

  document.getElementById('close-help').addEventListener('click', () => {
    document.getElementById('help-modal').style.display = 'none';
  });
}

// === Editor Page Logic ===
if (!isLandingPage) {
  document.querySelectorAll('.toolbar-btn').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('aria-label');
      handleButtonClick(action);
    });
  });

  document.getElementById('file-input').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      loadPDF(e.target.files[0]);
    }
  });

  document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('help-modal').style.display = 'block';
  });

  document.getElementById('close-help').addEventListener('click', () => {
    document.getElementById('help-modal').style.display = 'none';
  });

  document.getElementById('pdf-container').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    lastClick.x = e.clientX - rect.left + document.getElementById('pdf-container').scrollLeft;
    lastClick.y = e.clientY - rect.top + document.getElementById('pdf-container').scrollTop;
  });

  const currentFile = localStorage.getItem('currentFile');
}

// === Common Functions ===

function loadRecentFiles() {
  const list = document.getElementById('recent-list');
  list.innerHTML = '';

  const recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
  if (recent.length === 0) {
    list.innerHTML = '<li>No recent documents</li>';
  } else {
    recent.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      list.appendChild(li);
    });
  }
}

function loadPDF(file) {
  uploadedFileName = file.name.replace(/\.[^/.]+$/, "");
  updateRecentFiles(file.name);

  const reader = new FileReader();
  reader.onload = function() {
    const typedarray = new Uint8Array(this.result);

    if (window.innerWidth <= 768) {
      scale = Math.min(1.0, window.innerWidth / 800);
    } else {
      scale = 1.5;
    }

    pdfjsLib.getDocument(typedarray).promise.then(function(pdfDoc_) {
      pdfDoc = pdfDoc_;
      renderAllPages();
    });
  };
  reader.readAsArrayBuffer(file);
}

function updateRecentFiles(name) {
  let recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
  recent.unshift(name);
  recent = [...new Set(recent)];
  if (recent.length > 5) recent = recent.slice(0,5);
  localStorage.setItem('recentFiles', JSON.stringify(recent));
}

function renderAllPages() {
  const viewer = document.getElementById('pdf-viewer');
  viewer.innerHTML = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    pdfDoc.getPage(pageNum).then(function(page) {
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page.render({ canvasContext: ctx, viewport: viewport });
      viewer.appendChild(canvas);
    });
  }
}

function handleButtonClick(action) {
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
      scale = Math.min(scale + 0.25, 3.0);
      renderAllPages();
      break;
    case 'Zoom Out':
      scale = Math.max(scale - 0.25, 0.5);
      renderAllPages();
      break;
  }
}

// === Add Text
function createTextBox() {
  const textBox = document.createElement('div');
  textBox.className = 'text-box';
  textBox.contentEditable = true;
  textBox.style.top = `${lastClick.y}px`;
  textBox.style.left = `${lastClick.x}px`;
  textBox.innerText = "Edit text";

  enableDragResize(textBox);
  document.getElementById('user-layer').appendChild(textBox);
  elements.push(textBox);

  textBox.focus();
  textBox.addEventListener('touchstart', () => textBox.focus());
}

// === Signature Modal functions — handled elsewhere
