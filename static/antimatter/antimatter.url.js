const querySelector = document.querySelector;

querySelector('#initiate').addEventListener('click', initiate);
querySelector('#url-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    initiate();
  }
});

function initiate() {
  const inputElement = querySelector('#url-input');
  const url = inputElement.value.trim();

  if (url !== '') {
    window.location.href = url;
  } else {
    urlerror();
  }
}

function urlerror() {
  alert('Please enter a valid URL.');
}
