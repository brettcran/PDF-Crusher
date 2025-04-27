// === Final Luxury app.js ===

// Setup PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

let pdfDoc = null;
let scale = 1.5;
let uploadedFileName = "filled-pdf"; // Default fallback
let elements = []; // Text boxes and signatures for undo/redo
let undoStack = [];

document.getElementById('pdf-container').style.touchAction = "manipulation";

// Render all pages vertically
function renderAllPages() {
  document.getElementById('pdf-container').innerHTML = ''; // Clear old
  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    pdfDoc.getPage(pageNum).then(function(page) {
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      page.render({ canvasContext: ctx, viewport: viewport });

      document.getElementById('pdf-container').appendChild(canvas);
    });
  }
}

// Load PDF
function loadPDF(file) {
  uploadedFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove .pdf
  const reader = new FileReader();
  reader.onload = function() {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(function(pdfDoc_) {
      pdfDoc = pdfDoc_;
      renderAllPages();
    });
  };
  reader.readAsArrayBuffer(file);
}

// Save PDF
function savePDF() {
  html2canvas(document.getElementById('pdf-container'), { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${uploadedFileName}-filled.pdf`);
  });
}

// Handle toolbar button clicks
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
      uploadSignature();
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

// Attach button listeners
document.querySelectorAll('.toolbar-btn, .mobile-btn').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('aria-label');
    handleButtonClick(action);
  });
});

// File upload trigger
document.getElementById('file-input').addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    loadPDF(e.target.files[0]);
  }
});

// Create draggable editable text box
function createTextBox() {
  const textBox = document.createElement('div');
  textBox.className = 'text-box';
  textBox.contentEditable = true;
  textBox.style.top = "120px";
  textBox.style.left = "100px";
  textBox.innerText = "Edit text";

  enableDrag(textBox);
  document.getElementById('pdf-container').appendChild(textBox);
  elements.push(textBox);
}

// Upload and add a signature image
function uploadSignature() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.src = event.target.result;
      img.className = 'signature-image';
      img.style.position = 'absolute';
      img.style.top = "150px";
      img.style.left = "150px";

      enableDrag(img);
      document.getElementById('pdf-container').appendChild(img);
      elements.push(img);
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// Enable dragging for text/signature
function enableDrag(el) {
  el.style.position = 'absolute';
  let offsetX, offsetY;

  el.addEventListener('mousedown', (e) => {
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

// Undo
function undo() {
  if (elements.length > 0) {
    const el = elements.pop();
    undoStack.push(el);
    el.remove();
  }
}

// Redo
function redo() {
  if (undoStack.length > 0) {
    const el = undoStack.pop();
    document.getElementById('pdf-container').appendChild(el);
    elements.push(el);
  }
}
