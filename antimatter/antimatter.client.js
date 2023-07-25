const prefix = '/search/';
const searchEngine = 'https://duckduckgo.com/?q=';

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a').forEach(node => {
    node.href = proxifyUrl(node.href);
  });

  document.querySelectorAll('img').forEach(node => {
    node.src = proxifyUrl(node.src);
  });
});

function proxifyUrl(url) {
  url = url.replace(/\/$/gi, '');

  if (url.match(/^(about:|javascript:|#|tel:|mailto:)/g)) return url;

  if (url.startsWith('http')) {
    url = prefix + btoa(url);
  } else if (url.startsWith('//')) {
    url = prefix + btoa(url.replace(/^\/{2}/gi, 'https://'));
  } else {
    url = prefix + btoa(searchEngine + url);
  }

  return url;
}
