// === pdfHandler.js ===
// Handles PDF.js Loading, Rendering, Zooming

let pdfDoc = null;
let scale = 1.5;

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

// Load PDF from file
function loadPDF(file) {
  const reader = new FileReader();

  reader.onload = function() {
    const typedarray = new Uint8Array(this.result);

    if (window.innerWidth <= 768) {
      scale = Math.min(1.0, window.innerWidth / 800);
    } else {
      scale = 1.5;
    }

    pdfjsLib.getDocument(typedarray).promise
      .then((pdfDoc_) => {
        pdfDoc = pdfDoc_;
        renderAllPages();
      })
      .catch((err) => {
        alert('Failed to load PDF: ' + err.message);
      });
  };

  reader.onerror = function() {
    alert('Error reading file.');
  };

  reader.readAsArrayBuffer(file);
}

// Render all pages of PDF
function renderAllPages() {
  const viewer = document.getElementById('pdf-viewer');
  viewer.innerHTML = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    pdfDoc.getPage(pageNum).then((page) => {
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      page.render({ canvasContext: ctx, viewport });

      viewer.appendChild(canvas);
    });
  }
}

// Zoom In
function zoomIn() {
  if (scale < 3.0) {
    scale += 0.25;
    renderAllPages();
  }
}

// Zoom Out
function zoomOut() {
  if (scale > 0.5) {
    scale -= 0.25;
    renderAllPages();
  }
}
