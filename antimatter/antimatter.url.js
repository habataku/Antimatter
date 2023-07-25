const initiateButton = document.querySelector('#initiate');
const urlInput = document.querySelector('#url-input');
const errorDisc = document.getElementById("error-disc");

initiateButton.addEventListener('click', initiate);
urlInput.addEventListener('keyup', handleKeyUp);

function initiate() {
  const url = urlInput.value.trim();
  if (url !== "") {
    redirectToGateway(url);
  } else {
    showError();
  }
}

function handleKeyUp(e) {
  if (e.key === "Enter") {
    initiate();
  }
}

function redirectToGateway(url) {
  const gatewayUrl = "/search/query/?url=" + encodeURIComponent(url);
  location.href = gatewayUrl;
}

function showError() {
  errorDisc.style.display = "inherit";
}
