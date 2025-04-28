// === uiHandler.js ===
// Handles Toolbar Actions, Text Adding, Drag/Resize Elements

let elements = [];
let undoStack = [];
let lastClick = { x: 150, y: 200 };

// Add a text box to user layer
function createTextBox() {
  const textBox = document.createElement('div');
  textBox.className = 'text-box';
  textBox.contentEditable = true;
  textBox.innerText = 'Edit text';
  textBox.style.top = `${lastClick.y}px`;
  textBox.style.left = `${lastClick.x}px`;

  enableDragResize(textBox);
  document.getElementById('user-layer').appendChild(textBox);
  elements.push(textBox);

  textBox.focus();
  textBox.addEventListener('touchstart', () => textBox.focus());

  saveState();
}

// Enable dragging and resizing of an element
function enableDragResize(el) {
  el.style.position = 'absolute';
  el.style.userSelect = 'none';
  el.style.touchAction = 'none';
  el.style.zIndex = 1000;

  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;

  el.addEventListener('mousedown', (e) => {
    dragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  });

  el.addEventListener('touchstart', (e) => {
    dragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - el.offsetLeft;
    offsetY = touch.clientY - el.offsetTop;
    document.addEventListener('touchmove', touchMove);
    document.addEventListener('touchend', touchEnd);
  });

  function mouseMove(e) {
    if (dragging) {
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;
    }
  }

  function mouseUp() {
    dragging = false;
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
    saveState();
  }

  function touchMove(e) {
    if (dragging) {
      const touch = e.touches[0];
      el.style.left = `${touch.clientX - offsetX}px`;
      el.style.top = `${touch.clientY - offsetY}px`;
    }
  }

  function touchEnd() {
    dragging = false;
    document.removeEventListener('touchmove', touchMove);
    document.removeEventListener('touchend', touchEnd);
    saveState();
  }
}

// Undo last action
function undo() {
  if (undoStack.length > 0) {
    const prevState = undoStack.pop();
    restoreState(prevState);
  }
}

// Redo is skipped for now (optional for future)
function redo() {
  alert('Redo coming soon!');
}

// Save the current state for undo
function saveState() {
  const snapshot = elements.map(el => ({
    type: el.className,
    content: el.innerText,
    style: {
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
      height: el.style.height,
    }
  }));
  undoStack.push(snapshot);
}

// Restore a previous state
function restoreState(state) {
  const layer = document.getElementById('user-layer');
  layer.innerHTML = '';
  elements = [];

  state.forEach(item => {
    if (item.type === 'text-box') {
      const el = document.createElement('div');
      el.className = 'text-box';
      el.contentEditable = true;
      el.innerText = item.content;
      Object.assign(el.style, item.style);
      enableDragResize(el);
      layer.appendChild(el);
      elements.push(el);
    }
  });
}

// Track last click position
document.addEventListener('click', (e) => {
  const container = document.getElementById('pdf-container');
  if (container && container.contains(e.target)) {
    const rect = container.getBoundingClientRect();
    lastClick.x = e.clientX - rect.left + container.scrollLeft;
    lastClick.y = e.clientY - rect.top + container.scrollTop;
  }
});
