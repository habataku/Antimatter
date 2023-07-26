const initiateButton = document.querySelector('#initiate');
const urlInput = document.querySelector('#url-input');
const errorDisc = document.getElementById('error-disc');

initiateButton.addEventListener('click', handleButtonClick);
urlInput.addEventListener('keyup', handleInputKeyUp);

function handleButtonClick() {
  const url = urlInput.value.trim();
  if (url !== '') {
    const gatewayUrl = `/search/query/?url=${encodeURIComponent(url)}`;
    location.href = gatewayUrl;
  } else {
    showError('URL cannot be empty.');
  }
}

function handleInputKeyUp(e) {
  if (e.key === 'Enter') {
    const url = urlInput.value.trim();
    if (url !== '') {
      const gatewayUrl = `/search/query/?url=${encodeURIComponent(url)}`;
      location.href = gatewayUrl;
    } else {
      showError('URL cannot be empty.');
    }
  }
}

function showError(message) {
  errorDisc.textContent = message;
  errorDisc.style.display = 'inherit';
}
