// === FINAL Luxury app.js ===

// Setup PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

let pdfDoc = null;
let scale = 1.5;
let uploadedFileName = "filled-pdf";
let elements = [];
let undoStack = [];
let lastClick = { x: 150, y: 200 };

// Setup Signature Pad
let signaturePad, isDrawing = false;

// Setup Modal
const signatureModal = document.getElementById('signature-modal');
const signatureCanvas = document.getElementById('signature-pad');
const sigCtx = signatureCanvas.getContext('2d');

// === Capture last Click / Tap
document.getElementById('pdf-container').addEventListener('click', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  lastClick.x = e.clientX - rect.left + document.getElementById('pdf-container').scrollLeft;
  lastClick.y = e.clientY - rect.top + document.getElementById('pdf-container').scrollTop;
});

// === Render PDF Pages Vertically
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

// === Load PDF
function loadPDF(file) {
  uploadedFileName = file.name.replace(/\.[^/.]+$/, "");
  const reader = new FileReader();
  reader.onload = function() {
    const typedarray = new Uint8Array(this.result);

    // 🛠 Adjust scale depending on device
    scale = window.innerWidth <= 768 ? 1.0 : 1.5;

    pdfjsLib.getDocument(typedarray).promise.then(function(pdfDoc_) {
      pdfDoc = pdfDoc_;
      renderAllPages();
    });
  };
  reader.readAsArrayBuffer(file);
}

// === Save PDF Cleanly
function savePDF() {
  document.querySelectorAll('.text-box').forEach(el => el.classList.add('saving'));

  html2canvas(document.getElementById('pdf-container'), { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF({ orientation: 'portrait', unit: 'px' });

    const viewer = document.getElementById('pdf-viewer');
    const pageCanvases = viewer.querySelectorAll('canvas');

    let yOffset = 0;
    pageCanvases.forEach((pageCanvas, index) => {
      const imgDataPage = pageCanvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgDataPage);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (index > 0) pdf.addPage();
      pdf.addImage(imgDataPage, 'PNG', 0, 0, pdfWidth, pdfHeight);
    });

    pdf.save(`${uploadedFileName}-filled.pdf`);

    document.querySelectorAll('.text-box').forEach(el => el.classList.remove('saving'));
  });
}

// === Toolbar Button Actions
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

document.querySelectorAll('.toolbar-btn, .mobile-btn').forEach(button => {
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

// === Create Text Box
function createTextBox() {
  const textBox = document.createElement('div');
  textBox.className = 'text-box inactive';
  textBox.contentEditable = true;
  textBox.style.top = `${lastClick.y}px`;
  textBox.style.left = `${lastClick.x}px`;
  textBox.innerText = "Edit text";

  enableDragResize(textBox);
  document.getElementById('user-layer').appendChild(textBox);
  elements.push(textBox);

  textBox.addEventListener('focus', () => textBox.classList.remove('inactive'));
  textBox.addEventListener('blur', () => textBox.classList.add('inactive'));
}

// === Enable Drag and Resize
function enableDragResize(el) {
  el.style.position = 'absolute';
  el.style.resize = 'both';
  el.style.overflow = 'auto';
  el.style.pointerEvents = 'auto';
  let offsetX, offsetY;

  el.addEventListener('mousedown', (e) => {
    if (e.target !== el) return;
    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;

    function onMouseMove(ev) {
      el.style.left = (ev.clientX - offsetX) + 'px';
      el.style.top = (ev.clientY - offsetY) + 'px';
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// === Signature Modal
function openSignatureModal() {
  signatureModal.style.display = 'block';
  loadSavedSignatures();
}

document.getElementById('close-modal').onclick = () => signatureModal.style.display = 'none';

signatureCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  sigCtx.beginPath();
  sigCtx.moveTo(e.offsetX, e.offsetY);
});

signatureCanvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  sigCtx.lineTo(e.offsetX, e.offsetY);
  sigCtx.stroke();
});

signatureCanvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

document.getElementById('clear-signature').onclick = () => {
  sigCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
};

document.getElementById('save-signature').onclick = () => {
  const dataURL = signatureCanvas.toDataURL();
  saveSignature(dataURL);
  signatureModal.style.display = 'none';
  placeSignature(dataURL);
};

document.getElementById('upload-signature').onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function(event) {
    placeSignature(event.target.result);
    saveSignature(event.target.result);
    signatureModal.style.display = 'none';
  };
  reader.readAsDataURL(file);
};

function placeSignature(src) {
  const img = new Image();
  img.src = src;
  img.className = 'signature-image';
  img.style.top = `${lastClick.y}px`;
  img.style.left = `${lastClick.x}px`;

  enableDragResize(img);
  document.getElementById('user-layer').appendChild(img);
  elements.push(img);
}

// === LocalStorage Signatures
function saveSignature(dataURL) {
  let saved = JSON.parse(localStorage.getItem('signatures') || "[]");
  saved.unshift(dataURL);
  if (saved.length > 3) saved = saved.slice(0, 3);
  localStorage.setItem('signatures', JSON.stringify(saved));
}

function loadSavedSignatures() {
  const container = document.getElementById('saved-signatures');
  container.innerHTML = '';
  const saved = JSON.parse(localStorage.getItem('signatures') || "[]");
  saved.forEach(url => {
    const img = new Image();
    img.src = url;
    img.onclick = () => {
      placeSignature(url);
      signatureModal.style.display = 'none';
    };
    container.appendChild(img);
  });
}

// === Undo / Redo
function undo() {
  if (elements.length > 0) {
    const el = elements.pop();
    undoStack.push(el);
    el.remove();
  }
}

function redo() {
  if (undoStack.length > 0) {
    const el = undoStack.pop();
    document.getElementById('user-layer').appendChild(el);
    elements.push(el);
  }
}
