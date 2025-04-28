// === signatureHandler.js ===
// Handle signatures saving, loading, inserting

let signaturePad;
let savedSignatures = [];

function openSignatureModal() {
  document.getElementById('signature-modal').style.display = 'block';
  const canvas = document.getElementById('signature-pad');
  signaturePad = new SignaturePad(canvas);
  loadSavedSignatures();
}

function closeSignatureModal() {
  document.getElementById('signature-modal').style.display = 'none';
}

document.getElementById('close-modal').addEventListener('click', closeSignatureModal);
document.getElementById('clear-signature').addEventListener('click', () => {
  signaturePad.clear();
});
document.getElementById('save-signature').addEventListener('click', () => {
  if (!signaturePad.isEmpty()) {
    const dataURL = signaturePad.toDataURL();
    savedSignatures.push(dataURL);
    localStorage.setItem('savedSignatures', JSON.stringify(savedSignatures));
    loadSavedSignatures();
    signaturePad.clear();
  }
});

function loadSavedSignatures() {
  const container = document.getElementById('saved-signatures');
  container.innerHTML = '';
  savedSignatures = JSON.parse(localStorage.getItem('savedSignatures')) || [];

  savedSignatures.forEach((sig) => {
    const img = document.createElement('img');
    img.src = sig;
    img.style.width = '100px';
    img.style.margin = '5px';
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      insertSignature(sig);
      closeSignatureModal();
    });
    container.appendChild(img);
  });
}

function insertSignature(imageSrc) {
  const wrapper = document.createElement('div');
  wrapper.className = 'signature-wrapper';
  wrapper.style.left = `${lastClick.x}px`;
  wrapper.style.top = `${lastClick.y}px`;

  const img = document.createElement('img');
  img.src = imageSrc;
  img.className = 'signature-image';

  wrapper.appendChild(img);
  wrapper.addEventListener('mousedown', startDrag);

  document.getElementById('user-layer').appendChild(wrapper);
  saveHistory();
}
