// === pdfHandler.js ===

let pdfDoc = null;
let currentScale = 1.0;

// Load PDF
async function loadPDF(dataUrl) {
  const loadingTask = pdfjsLib.getDocument({ data: atob(dataUrl.split(',')[1]) });
  pdfDoc = await loadingTask.promise;
  renderAllPages();
}

async function renderAllPages() {
  pdfContainer.innerHTML = ''; // Clear previous
  const userLayer = document.createElement('div');
  userLayer.id = 'user-layer';
  userLayer.style.position = 'absolute';
  userLayer.style.top = '0';
  userLayer.style.left = '0';
  userLayer.style.right = '0';
  userLayer.style.bottom = '0';
  userLayer.style.pointerEvents = 'none';
  pdfContainer.appendChild(userLayer);

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: currentScale });

    const canvas = document.createElement('canvas');
    canvas.className = 'pdf-page';
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = { canvasContext: context, viewport };
    await page.render(renderContext).promise;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.margin = '20px auto';
    wrapper.appendChild(canvas);

    pdfContainer.appendChild(wrapper);
  }
}

// Save PDF
async function savePDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'px', format: 'a4' });

  const pages = pdfContainer.querySelectorAll('.pdf-page');

  for (let i = 0; i < pages.length; i++) {
    const canvas = pages[i];
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i !== 0) pdf.addPage();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  pdf.save('document.pdf');
}

// Zoom Functions
function zoomIn() {
  currentScale += 0.1;
  renderAllPages();
}

function zoomOut() {
  currentScale = Math.max(currentScale - 0.1, 0.5);
  renderAllPages();
}
