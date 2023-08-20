const http = require('http');
const url = require('url');
const request = require('request');
const atob = require('atob');

const proxyServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const decodedUrl = atob(parsedUrl.query.url);

  if (req.method === 'GET') {
    proxy(decodedUrl, req, res);
  } else if (req.method === 'POST') {
    post(decodedUrl, req, res);
  }
});

function proxy(targetUrl, req, res) {
  const options = {
    url: targetUrl,
    headers: req.headers,
  };

  request.get(options).pipe(res);
}

function post(targetUrl, req, res) {
  const options = {
    url: targetUrl,
    headers: req.headers,
    body: req.body,
  };

  request.post(options).pipe(res);
}

proxyServer.listen(8080, () => {
  console.log('Antimatter proxy is running on port 8080.');
});
