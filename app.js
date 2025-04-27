// === app.js ===

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

let isTextMode = false;
let isSignatureMode = false;
let pdfDoc = null;
let currentPage = 1;
let pageAnnotations = JSON.parse(localStorage.getItem('annotations') || '{}');
let undoStack = [];
let redoStack = [];
let zoomScale = 1.5;

const pdfContainer = document.getElementById('pdf-container');
const fontSizeSelect = document.getElementById('font-size-select');
const colorPicker = document.getElementById('color-picker');
const pageInfo = document.getElementById('page-info');
const installBanner = document.getElementById('install-banner');
let deferredPrompt;

// Save annotations
function saveToLocalStorage() {
  localStorage.setItem('annotations', JSON.stringify(pageAnnotations));
}

// Enable Text Tool
function enableTextTool() {
  isTextMode = true;
  isSignatureMode = false;
  pdfContainer.style.cursor = 'text';
}

// Enable Signature Tool
function enableSignatureTool() {
  isSignatureMode = true;
  isTextMode = false;
  pdfContainer.style.cursor = 'crosshair';
}

document.getElementById('text-tool-btn').addEventListener('click', enableTextTool);
document.getElementById('signature-tool-btn').addEventListener('click', enableSignatureTool);

// Load PDF
document.getElementById('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file && file.type === 'application/pdf') {
    const fileReader = new FileReader();
    fileReader.onload = async function() {
      const typedarray = new Uint8Array(this.result);
      pdfDoc = await pdfjsLib.getDocument({ data: typedarray }).promise;
      currentPage = 1;
      pageAnnotations = {}; // Reset
      renderPage(currentPage);
    };
    fileReader.readAsArrayBuffer(file);
  }
});

// Render Page
async function renderPage(num) {
  if (pdfDoc) saveCurrentAnnotations();
  const page = await pdfDoc.getPage(num);
  const viewport = page.getViewport({ scale: zoomScale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  await page.render({canvasContext: context, viewport: viewport}).promise;

  pdfContainer.innerHTML = '';
  pdfContainer.appendChild(canvas);
  pageInfo.textContent = `Page ${currentPage}`;
  restoreAnnotations();
}

// Save current annotations
function saveCurrentAnnotations() {
  const annotations = pdfContainer.querySelectorAll('.text-box, .signature-wrapper');
  pageAnnotations[currentPage] = [];
  annotations.forEach(node => {
    pageAnnotations[currentPage].push(node.outerHTML);
  });
  saveToLocalStorage();
}

// Restore annotations
function restoreAnnotations() {
  if (pageAnnotations[currentPage]) {
    pageAnnotations[currentPage].forEach(html => {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const el = temp.firstChild;
      pdfContainer.appendChild(el);
      enableElementInteractions(el);
    });
  }
}

// Enable dragging/resizing/deleting
function enableElementInteractions(el) {
  if (el.classList.contains('text-box') || el.classList.contains('signature-wrapper')) {
    el.addEventListener('mousedown', dragStart);
    el.addEventListener('touchstart', dragStart);
    const deleteBtn = el.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        el.remove();
        pushUndo();
      });
    }
  }
}

// Dragging function
function dragStart(e) {
  e.preventDefault();
  const el = e.currentTarget;
  const startX = (e.touches ? e.touches[0].clientX : e.clientX) - el.offsetLeft;
  const startY = (e.touches ? e.touches[0].clientY : e.clientY) - el.offsetTop;

  function moveAt(ev) {
    el.style.left = (ev.touches ? ev.touches[0].clientX : ev.clientX) - startX + 'px';
    el.style.top = (ev.touches ? ev.touches[0].clientY : ev.clientY) - startY + 'px';
  }

  function stopDrag() {
    document.removeEventListener('mousemove', moveAt);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', moveAt);
    document.removeEventListener('touchend', stopDrag);
    pushUndo();
  }

  document.addEventListener('mousemove', moveAt);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', moveAt);
  document.addEventListener('touchend', stopDrag);
}

// Undo/Redo System
function pushUndo() {
  saveCurrentAnnotations();
  undoStack.push(JSON.stringify(pageAnnotations));
  redoStack = [];
}

document.getElementById('undo-btn').addEventListener('click', () => {
  if (undoStack.length > 0) {
    redoStack.push(JSON.stringify(pageAnnotations));
    pageAnnotations = JSON.parse(undoStack.pop());
    renderPage(currentPage);
  }
});

document.getElementById('redo-btn').addEventListener('click', () => {
  if (redoStack.length > 0) {
    undoStack.push(JSON.stringify(pageAnnotations));
    pageAnnotations = JSON.parse(redoStack.pop());
    renderPage(currentPage);
  }
});

// Zoom In / Zoom Out
document.getElementById('zoom-in-btn').addEventListener('click', () => {
  zoomScale += 0.2;
  renderPage(currentPage);
});

document.getElementById('zoom-out-btn').addEventListener('click', () => {
  zoomScale = Math.max(1, zoomScale - 0.2);
  renderPage(currentPage);
});

// Page Navigation
document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
});

document.getElementById('next-page').addEventListener('click', () => {
  if (currentPage < pdfDoc.numPages) {
    currentPage++;
    renderPage(currentPage);
  }
});

// Add Text
pdfContainer.addEventListener('click', function (e) {
  if (isTextMode) {
    const wrapper = document.createElement('div');
    wrapper.className = 'text-box';
    wrapper.style.left = `${e.offsetX}px`;
    wrapper.style.top = `${e.offsetY}px`;
    wrapper.style.color = colorPicker.value;

    const textBox = document.createElement('div');
    textBox.contentEditable = true;
    textBox.innerText = 'Type here...';
    textBox.style.fontSize = fontSizeSelect.value + 'px';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerText = '×';

    wrapper.appendChild(textBox);
    wrapper.appendChild(deleteBtn);
    pdfContainer.appendChild(wrapper);
    enableElementInteractions(wrapper);
    pushUndo();
  }
});

// Save as PDF
document.getElementById('save-pdf-btn').addEventListener('click', async () => {
  saveCurrentAnnotations();
  const { js
