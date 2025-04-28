// === uiHandler.js ===
// Handle textboxes, dragging, undo/redo

let history = [];
let redoStack = [];
let lastClick = { x: 100, y: 100 };

function createTextBox() {
  const textBox = document.createElement('div');
  textBox.className = 'text-box editing';
  textBox.contentEditable = true;
  textBox.innerText = 'Text';
  textBox.style.left = `${lastClick.x}px`;
  textBox.style.top = `${lastClick.y}px`;

  textBox.addEventListener('mousedown', startDrag);
  textBox.addEventListener('focus', () => {
    textBox.classList.add('editing');
  });
  textBox.addEventListener('blur', () => {
    textBox.classList.remove('editing');
  });

  document.getElementById('user-layer').appendChild(textBox);
  textBox.focus();
  saveHistory();
}

function startDrag(e) {
  const element = e.target.closest('.text-box, .signature-wrapper');
  if (!element) return;

  let offsetX = e.clientX - element.getBoundingClientRect().left;
  let offsetY = e.clientY - element.getBoundingClientRect().top;

  function moveAt(ev) {
    element.style.left = `${ev.clientX - offsetX}px`;
    element.style.top = `${ev.clientY - offsetY}px`;
  }

  function onUp() {
    document.removeEventListener('mousemove', moveAt);
    document.removeEventListener('mouseup', onUp);
    saveHistory();
  }

  document.addEventListener('mousemove', moveAt);
  document.addEventListener('mouseup', onUp);
}

function undo() {
  if (history.length > 0) {
    const state = history.pop();
    redoStack.push(document.getElementById('user-layer').innerHTML);
    document.getElementById('user-layer').innerHTML = state;
    restoreEventListeners();
  }
}

function redo() {
  if (redoStack.length > 0) {
    const state = redoStack.pop();
    history.push(document.getElementById('user-layer').innerHTML);
    document.getElementById('user-layer').innerHTML = state;
    restoreEventListeners();
  }
}

function saveHistory() {
  history.push(document.getElementById('user-layer').innerHTML);
  redoStack = [];
}

function restoreEventListeners() {
  document.querySelectorAll('.text-box, .signature-wrapper').forEach(el => {
    el.addEventListener('mousedown', startDrag);
  });
}

// Track last click
document.addEventListener('click', (e) => {
  if (e.target.closest('#toolbar') || e.target.closest('.modal')) return;
  lastClick = { x: e.pageX, y: e.pageY };
});
