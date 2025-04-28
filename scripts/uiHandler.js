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

  enableSmartDrag(textBox);
  document.getElementById('user-layer').appendChild(textBox);
  elements.push(textBox);

  setTimeout(() => {
    textBox.focus();
  }, 100); // slight delay for mobile keyboard
  saveState();
}

// Smart Dragging and Editing
function enableSmartDrag(el) {
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let longPressTimer = null;

  el.style.position = 'absolute';
  el.style.userSelect = 'none';
  el.style.touchAction = 'none';
  el.style.zIndex = 1000;

  el.addEventListener('mousedown', startHold);
  el.addEventListener('touchstart', startHold);

  function startHold(e) {
    e.preventDefault();
    if (e.type === 'mousedown' && e.button !== 0) return;

    longPressTimer = setTimeout(() => {
      dragging = true;
      offsetX = (e.touches ? e.touches[0].clientX : e.clientX) - el.offsetLeft;
      offsetY = (e.touches ? e.touches[0].clientY : e.clientY) - el.offsetTop;
    }, 200); // 200ms long-press triggers drag
  }

  el.addEventListener('mousemove', (e) => {
    if (dragging) {
      el.style.left = `${(e.clientX - offsetX)}px`;
      el.style.top = `${(e.clientY - offsetY)}px`;
    }
  });

  el.addEventListener('touchmove', (e) => {
    if (dragging && e.touches.length === 1) {
      const touch = e.touches[0];
      el.style.left = `${(touch.clientX - offsetX)}px`;
      el.style.top = `${(touch.clientY - offsetY)}px`;
    }
  });

  el.addEventListener('mouseup', endHold);
  el.addEventListener('touchend', endHold);

  function endHold(e) {
    clearTimeout(longPressTimer);
    if (dragging) {
      dragging = false;
      saveState();
    } else {
      el.focus(); // Tap (not drag) = focus to edit
    }
  }

  el.addEventListener('click', () => {
    el.focus();
  });

  el.addEventListener('focus', () => {
    el.style.border = '2px solid #4f46e5';
    el.style.background = 'rgba(255,255,255,0.95)';
  });

  el.addEventListener('blur', () => {
    el.style.border = '2px dashed #6366f1';
    el.style.background = 'rgba(255,255,255,0.7)';
  });
}

// Undo last action
function undo() {
  if (undoStack.length > 0) {
    const prevState = undoStack.pop();
    restoreState(prevState);
  }
}

// Redo is skipped for now (optional future feature)
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
      enableSmartDrag(el);
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
