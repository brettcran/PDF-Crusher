// === Fixed app.js (for icon-only UI) ===

// Setup PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

document.getElementById('pdf-container').appendChild(canvas);

// Render a page
function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    const renderTask = page.render(renderContext);

    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  document.getElementById('page-info').style.display = 'inline-block';
  document.getElementById('page-info').textContent = `Page ${num}`;
}

// Queue rendering
function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

// Upload PDF
function loadPDF(file) {
  const reader = new FileReader();
  reader.onload = function() {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(function(pdfDoc_) {
      pdfDoc = pdfDoc_;
      pageNum = 1;
      renderPage(pageNum);
    });
  };
  reader.readAsArrayBuffer(file);
}

// Save PDF as image
function savePDF() {
  html2canvas(document.getElementById('pdf-container')).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF();
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save('filled-pdf.pdf');
  });
}

// Button actions based on aria-label
function handleButtonClick(action) {
  switch (action) {
    case 'Upload PDF':
      document.getElementById('file-input').click();
      break;
    case 'Save PDF':
      savePDF();
      break;
    case 'Add Text':
      alert('Text tool clicked (feature coming soon)');
      break;
    case 'Add Signature':
      alert('Signature tool clicked (feature coming soon)');
      break;
    case 'Undo':
      alert('Undo clicked (feature coming soon)');
      break;
    case 'Redo':
      alert('Redo clicked (feature coming soon)');
      break;
    case 'Zoom In':
      scale = Math.min(scale + 0.25, 3.0);
      queueRenderPage(pageNum);
      break;
    case 'Zoom Out':
      scale = Math.max(scale - 0.25, 0.5);
      queueRenderPage(pageNum);
      break;
    case 'Prev Page':
      if (pageNum > 1) {
        pageNum--;
        queueRenderPage(pageNum);
      }
      break;
    case 'Next Page':
      if (pageNum < pdfDoc.numPages) {
        pageNum++;
        queueRenderPage(pageNum);
      }
      break;
  }
}

// Attach event listeners
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
