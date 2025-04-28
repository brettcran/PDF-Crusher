function createTextBox() {
  const textBox = document.createElement('div');
  textBox.className = 'text-box';
  textBox.contentEditable = true;
  textBox.innerText = 'Enter text';
  textBox.style.top = `${lastClick.y}px`;
  textBox.style.left = `${lastClick.x}px`;
  textBox.style.background = 'transparent'; // Transparent background

  enableSmartDrag(textBox);
  document.getElementById('user-layer').appendChild(textBox);
  elements.push(textBox);

  setTimeout(() => {
    textBox.focus();
  }, 100);
  saveState();
}

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
    }, 200);
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
      el.focus();
    }
  }

  el.addEventListener('click', () => {
    el.focus();
  });

  el.addEventListener('focus', () => {
    el.style.border = '2px solid #4f46e5';
    el.style.background = 'rgba(255, 255, 255, 0.8)';
  });

  el.addEventListener('blur', () => {
    el.style.border = '2px dashed #6366f1';
    el.style.background = 'transparent';
  });
}
