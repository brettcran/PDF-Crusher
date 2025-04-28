// scripts/pdfHandler.js

let pdfDoc = null;
let scale = 1.0;

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('pdfData')) {
    loadPDF(sessionStorage.getItem('pdfData'));
  }
});

function loadPDF(data) {
  const loadingTask = pdfjsLib.getDocument({ data: atob(data.split(',')[1]) });
  loadingTask.promise.then((doc) => {
    pdfDoc = doc;
    renderAllPages();
  });
}

function renderAllPages() {
  const container = document.getElementById('pdf-container');
  container.innerHTML = '';
  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    pdfDoc.getPage(pageNum).then(page => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      page.render({ canvasContext: context, viewport: viewport });
      container.appendChild(canvas);
    });
  }
}

function zoomIn() {
  scale += 0.1;
  renderAllPages();
}

function zoomOut() {
  scale = Math.max(0.5, scale - 0.1);
  renderAllPages();
}

function savePDF() {
  const container = document.getElementById('pdf-container');
  html2canvas(container, { backgroundColor: '#ffffff' }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('pdf-crusher-edited.pdf');
  });
}
