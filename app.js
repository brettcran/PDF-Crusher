// === Final Luxury app.js ===

// Setup PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
let uploadedFileName = "filled-pdf"; // Default fallback

document.getElementById('pdf-container').appendChild(canvas);

// Enable pinch zoom (allow touch gestures)
document.getElementById('pdf-container').style.touchAction = "manipulation";

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

// Load uploaded PDF
function loadPDF(file) {
  uploadedFileName = file.name.replace(/\.[^/.]+$/, ""); // Remove .pdf extension
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
  const tempScale = 1.5; // Reset scale for export
  const originalTransform = canvas.style.transform;
  canvas.style.transform = '';

  html2canvas(document.getElementById('pdf-container'), { scale: tempScale }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF();
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save(`${uploadedFileName}-filled.pdf`);
    // Restore any transforms
    canvas.style.transform = originalTransform;
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
      alert('Undo clicked (undo feature coming soon)');
      break;
    case 'Redo':
      alert('Redo clicked (redo feature coming soon)');
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

// Create draggable editable text box
function createTextBox() {
  const textBox = document.createElement('div');
  textBox.className = 'text-box';
  textBox.contentEditable = true;
  textBox.style.top = "100px";
  textBox.style.left = "100px";
  textBox.innerText = "Edit text";
  textBox.draggable = true;

  textBox.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', null);
    let offsetX = e.offsetX;
    let offsetY = e.offsetY;

    function onDragMove(ev) {
      textBox.style.left = (ev.pageX - offsetX) + 'px';
      textBox.style.top = (ev.pageY - offsetY) + 'px';
    }

    function onDragEnd() {
      document.removeEventListener('dragover', onDragMove);
      document.removeEventListener('drop', onDragEnd);
    }

    document.addEventListener('dragover', onDragMove);
    document.addEventListener('drop', onDragEnd);
  });

  document.getElementById('pdf-container').appendChild(textBox);
}

// Upload a signature image
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
      img.style.width = "100px";
      img.style.height = "auto";
      img.draggable = true;

      img.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', null);
        let offsetX = e.offsetX;
        let offsetY = e.offsetY;

        function onDragMove(ev) {
          img.style.left = (ev.pageX - offsetX) + 'px';
          img.style.top = (ev.pageY - offsetY) + 'px';
        }

        function onDragEnd() {
          document.removeEventListener('dragover', onDragMove);
          document.removeEventListener('drop', onDragEnd);
        }

        document.addEventListener('dragover', onDragMove);
        document.addEventListener('drop', onDragEnd);
      });

      document.getElementById('pdf-container').appendChild(img);
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
