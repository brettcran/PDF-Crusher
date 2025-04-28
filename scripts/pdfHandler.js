// === pdfHandler.js ===
// Handle PDF Saving with overlays

async function savePDF() {
  const viewer = document.getElementById('pdf-viewer');
  const userLayer = document.getElementById('user-layer');

  // Clone current canvas with text/signatures overlaid
  const combined = document.createElement('div');
  combined.style.position = 'relative';
  combined.style.width = `${viewer.offsetWidth}px`;
  combined.style.height = `${viewer.offsetHeight}px`;

  const pdfCanvas = viewer.querySelector('canvas');
  const userLayerClone = userLayer.cloneNode(true);

  pdfCanvas.style.position = 'absolute';
  pdfCanvas.style.top = '0';
  pdfCanvas.style.left = '0';
  combined.appendChild(pdfCanvas.cloneNode(true));

  userLayerClone.querySelectorAll('.text-box, .signature-wrapper').forEach(box => {
    box.style.position = 'absolute';
    box.style.background = 'transparent';
    combined.appendChild(box.cloneNode(true));
  });

  const canvas = await html2canvas(combined, { backgroundColor: null });
  const imgData = canvas.toDataURL('image/jpeg', 1.0);

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('portrait', 'pt', [canvas.width, canvas.height]);
  pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);

  // Use stored filename if available
  const filename = localStorage.getItem('currentFile') || 'edited.pdf';
  pdf.save(filename);

  // After save, redirect to landing page
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}
