// scripts/pdfHandler.js

let pdfDoc = null;
let currentPage = 1;
let scale = 1.0;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.getElementById('pdf-container').appendChild(canvas);

const pdfData = sessionStorage.getItem('pdfData');
const pdfName = sessionStorage.getItem('pdfName') || 'document.pdf';

if (pdfData) {
  const loadingTask = pdfjsLib.getDocument({ data: atob(pdfData.split(',')[1]) });
  loadingTask.promise.then(function (pdf) {
    pdfDoc = pdf;
    renderPage(currentPage);
  });
}

function renderPage(num) {
  pdfDoc.getPage(num).then(function (page) {
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    page.render(renderContext);
  });
}

function zoomIn() {
  scale += 0.1;
  renderPage(currentPage);
}

function zoomOut() {
  if (scale > 0.2) {
    scale -= 0.1;
    renderPage(currentPage);
  }
}

function savePDF() {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('application/pdf');
  link.download = pdfName;
  link.click();
}
