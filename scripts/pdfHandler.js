// === pdfHandler.js ===
// Handle PDF saving correctly

async function savePDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'pt', 'a4');
  const canvases = document.querySelectorAll('#pdf-container canvas');

  const userLayer = document.getElementById('user-layer');
  const userItems = userLayer ? Array.from(userLayer.children) : [];

  const pdfWidth = 595.28; // A4 width in pt
  const pdfHeight = 841.89; // A4 height in pt

  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    // Draw the original PDF page
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Draw textboxes and signatures for this page
    userItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();

      const offsetX = rect.left - canvasRect.left;
      const offsetY = rect.top - canvasRect.top;

      if (offsetX >= 0 && offsetY >= 0 &&
          offsetX <= canvasRect.width && offsetY <= canvasRect.height) {

        if (item.classList.contains('text-box')) {
          pdf.setFontSize(16);
          pdf.setTextColor(0, 0, 0);
          pdf.text(item.innerText || '', (offsetX / canvasRect.width) * pdfWidth, (offsetY / canvasRect.height) * pdfHeight);
        }

        if (item.classList.contains('signature-wrapper')) {
          const img = item.querySelector('img');
          if (img) {
            const imgWidth = (rect.width / canvasRect.width) * pdfWidth;
            const imgHeight = (rect.height / canvasRect.height) * pdfHeight;
            pdf.addImage(img.src, 'PNG', (offsetX / canvasRect.width) * pdfWidth, (offsetY / canvasRect.height) * pdfHeight, imgWidth, imgHeight);
          }
        }
      }
    });

    // Add page if not last page
    if (i < canvases.length - 1) {
      pdf.addPage();
    }
  }

  const filename = localStorage.getItem('currentFile') || 'document.pdf';
  pdf.save(filename);
}
