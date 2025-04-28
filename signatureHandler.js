// === signatureHandler.js ===
// Handles Signature Modal, Drawing, Saving, Uploading

let signaturePad;
let savedSignatures = [];

// Open Signature Modal
function openSignatureModal() {
  const modal = document.getElementById('signature-modal');
  if (modal) {
    modal.style.display = 'block';
    initSignaturePad();
  }
}

// Initialize Signature Pad
function initSignaturePad() {
  const canvas = document.getElementById('signature-pad');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let drawing = false;

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('touchstart', startDraw);

  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('touchmove', draw);

  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('touchend', endDraw);

  function startDraw(e) {
    e.preventDefault();
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(getX(e), getY(e));
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    ctx.lineTo(getX(e), getY(e));
    ctx.stroke();
  }

  function endDraw(e) {
    e.preventDefault();
    drawing = false;
  }

  function getX(e) {
    return e.touches ? e.touches[0].clientX - canvas.getBoundingClientRect().left : e.clientX - canvas.getBoundingClientRect().left;
  }

  function getY(e) {
    return e.touches ? e.touches[0].clientY - canvas.getBoundingClientRect().top : e.clientY - canvas.getBoundingClientRect().top;
  }

  document.getElementById('clear-signature').onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  document.getElementById('save-signature').onclick = () => {
    const imgURL = canvas.toDataURL('image/png');
    savedSignatures.push(imgURL);
    renderSavedSignatures();
    closeSignatureModal();
  };

  document.getElementById('upload-signature').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(event) {
        savedSignatures.push(event.target.result);
        renderSavedSignatures();
        closeSignatureModal();
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('close-modal').onclick = closeSignatureModal;
}

// Close Signature Modal
function closeSignatureModal() {
  const modal = document.getElementById('signature-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Render saved signatures
function renderSavedSignatures() {
  const container = document.getElementById('saved-signatures');
  if (!container) return;
  container.innerHTML = '';

  savedSignatures.forEach((src) => {
    const img = document.createElement('img');
    img.src = src;
    img.style.width = '100px';
    img.style.height = '50px';
    img.style.margin = '5px';
    img.style.cursor = 'pointer';

    img.addEventListener('click', () => {
      insertSignature(img.src);
    });

    container.appendChild(img);
  });
}

// Insert Signature onto PDF
function insertSignature(src) {
  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'signature-wrapper';
  imgWrapper.style.top = `${lastClick.y}px`;
  imgWrapper.style.left = `${lastClick.x}px`;

  const img = document.createElement('img');
  img.className = 'signature-image';
  img.src = src;

  imgWrapper.appendChild(img);
  enableDragResize(imgWrapper);
  document.getElementById('user-layer').appendChild(imgWrapper);
  elements.push(imgWrapper);

  saveState();
}
