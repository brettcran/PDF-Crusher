// scripts/uiHandler.js

function createTextBoxAt(x, y) {
  const textBox = document.createElement('div');
  textBox.className = 'text-box';
  textBox.contentEditable = true;
  textBox.style.position = 'absolute';
  textBox.style.left = `${x - 50}px`;
  textBox.style.top = `${y - 15}px`;
  textBox.style.minWidth = '100px';
  textBox.style.minHeight = '30px';
  textBox.style.padding = '6px 10px';
  textBox.style.border = '1px dashed #6366f1';
  textBox.style.borderRadius = '8px';
  textBox.style.background = 'transparent';
  textBox.style.color = '#111827';
  textBox.style.fontSize = '16px';
  textBox.style.cursor = 'move';
  textBox.draggable = true;
  textBox.style.zIndex = '10';

  document.getElementById('pdf-container').appendChild(textBox);

  enableDrag(textBox);

  textBox.addEventListener('focusout', () => {
    textBox.style.border = 'none';
  });

  textBox.addEventListener('focus', () => {
    textBox.style.border = '1px dashed #6366f1';
  });

  textBox.focus();
}

function enableDrag(element) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  element.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      element.style.left = `${e.clientX - offsetX}px`;
      element.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Mobile touch support
  element.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - element.offsetLeft;
    offsetY = touch.clientY - element.offsetTop;
  });

  document.addEventListener('touchmove', (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      element.style.left = `${touch.clientX - offsetX}px`;
      element.style.top = `${touch.clientY - offsetY}px`;
    }
  });

  document.addEventListener('touchend', () => {
    isDragging = false;
  });
}

function undo() {
  alert('Undo not implemented yet.');
}

function redo() {
  alert('Redo not implemented yet.');
}
