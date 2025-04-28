// scripts/uiHandler.js

function createTextBox() {
  const div = document.createElement('div');
  div.contentEditable = true;
  div.className = 'text-box';
  div.style.position = 'absolute';
  div.style.top = '150px';
  div.style.left = '100px';
  div.style.minWidth = '100px';
  div.style.minHeight = '30px';
  div.style.background = 'transparent';
  div.style.color = '#111827';
  div.style.fontSize = '16px';
  div.style.border = '1px dashed #4f46e5';
  div.style.padding = '4px 8px';
  div.style.borderRadius = '8px';
  div.style.cursor = 'move';
  document.getElementById('pdf-container').appendChild(div);

  div.draggable = true;
  div.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', '');
  });
  div.addEventListener('dragend', (e) => {
    div.style.left = `${e.pageX - 50}px`;
    div.style.top = `${e.pageY - 15}px`;
  });
}

function undo() {
  // Optional: To implement if undo/redo flow needed
}

function redo() {
  // Optional: To implement if undo/redo flow needed
}
