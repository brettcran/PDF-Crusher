// scripts/pdfHandler.js

let pdfDoc = null;
let currentPage = 1;
let scale = 1.0;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('pdf-container');

if (container) {
  container.appendChild(canvas);
}

const pdfData = sessionStorage.getItem('pdfData');
const pdfName = sessionStorage.getItem('pdfName') || 'document.pdf';

if (pdfData) {
  loadPDF();
}

function loadPDF() {
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
    centerCanvas();

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
  const saveCanvas = document.createElement('canvas');
  const saveCtx = saveCanvas.getContext('2d');

  saveCanvas.width = canvas.width;
  saveCanvas.height = canvas.height;

  // Draw PDF
  saveCtx.drawImage(canvas, 0, 0);

  // Draw all text boxes
  const textBoxes = document.querySelectorAll('.text-box');
  textBoxes.forEach(box => {
    saveCtx.font = `${parseInt(box.style.fontSize) || 16}px Poppins, Inter, sans-serif`;
    saveCtx.fillStyle = box.style.color || "#000";
    const text = box.innerText.trim();
    if (text) {
      const rect = box.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const x = rect.left - containerRect.left;
      const y = rect.top - containerRect.top + parseInt(box.style.fontSize || 16);
      saveCtx.fillText(text, x, y);
    }
  });

  // Draw all signatures
  const sigs = document.querySelectorAll('.signature-image');
  sigs.forEach(img => {
    const rect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top;
    saveCtx.drawImage(img, x, y, img.width, img.height);
  });

  const link = document.createElement('a');
  link.href = saveCanvas.toDataURL('application/pdf');
  link.download = pdfName;
  link.click();
}

function centerCanvas() {
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
}

window.addEventListener('resize', () => {
  centerCanvas();
});
