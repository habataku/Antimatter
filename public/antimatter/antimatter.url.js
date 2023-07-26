class AntimatterURL {
  constructor() {
    this.initiateButton = document.querySelector('#initiate');
    this.urlInput = document.querySelector('#url-input');
    this.errorDisc = document.getElementById('error-disc');

    this.init = this.init.bind(this);
    this.initiate = this.initiate.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.init();
  }

  init() {
    this.initiateButton.addEventListener('click', this.initiate);
    this.urlInput.addEventListener('keyup', this.handleKeyUp);
  }

  initiate() {
    const url = this.urlInput.value.trim();
    if (url !== '') {
      this.redirectToGateway(url);
    } else {
      this.showError();
    }
  }

  handleKeyUp(e) {
    if (e.key === 'Enter') {
      this.initiate();
    }
  }

  redirectToGateway(url) {
    const gatewayUrl = '/search/query/?url=' + encodeURIComponent(url);
    location.href = gatewayUrl;
  }

  showError() {
    this.errorDisc.style.display = 'inherit';
  }
}

function initializeAntimatterURL() {
  new AntimatterURL();
}

// Initialize the AntimatterURL module when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeAntimatterURL);
