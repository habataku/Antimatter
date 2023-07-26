const http = require('http');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const https = require('https');
const request = require('request');

const btoa = str => Buffer.from(str).toString('base64');
const atob = str => Buffer.from(str, 'base64').toString('utf-8');

class AntiMatterProxy {
  constructor(prefix, config = {}) { this.prefix = prefix; this.config = config; }

  request(req, res) {
    if (req.url.replace(this.prefix, '') === 'antimatter') {
      return this.serveAntimatterClient(req, res);
    }

    const proxy = this.getProxyData(req);

    try { new URL(proxy.url); } catch (err) { return res.end('Invalid URL: ' + proxy.url + ', ' + err); }

    const requestProtocol = proxy.url.startsWith('https://') ? https : http;

    const requestMain = requestProtocol.request(this.proxyURL(req), proxy.options, response => {
      let pData = []; let sendData = '';
      response.on('data', (data) => { pData.push(data) }).on('end', () => {
        const proxify = this.createProxifyFunctions(proxy);
        Object.entries(response.headers).forEach(([header_name, header_value]) => {
          if (header_name === 'set-cookie') { const cookie_array = []; header_value.forEach(cookie => cookie_array.push(cookie.replace(/Domain=(.*?);/gi, `Domain=` + req.headers['host'] + ';').replace(/(.*?)=(.*?);/, '$1' + '@' + proxy.spliceURL.hostname + `=` + '$2' + ';'))); response.headers[header_name] = cookie_array; }
          if (header_name.startsWith('content-encoding') || header_name.startsWith('x-') || header_name.startsWith('cf-') || header_name.startsWith('strict-transport-security') || header_name.startsWith('content-security-policy') || header_name.startsWith('content-length')) delete response.headers[header_name];
          if (header_name === 'location') response.headers[header_name] = proxify.url(header_value);
        });
        sendData = Buffer.concat(pData);
        if (!response.headers['content-type']) { response.headers['content-type'] = 'text/plain; charset=UTF-8'; }
        if (response.headers['content-type'].startsWith('text/html')) { sendData = proxify.html(sendData.toString()); } else if (response.headers['content-type'].startsWith('application/javascript' || 'text/javascript')) { sendData = proxify.js(sendData.toString()); } else if (response.headers['content-type'].startsWith('text/css')) { sendData = proxify.css(sendData.toString()); }
        res.writeHead(response.statusCode, response.headers).end(sendData);
      });
    }).on('error', err => res.end(fs.readFileSync('./public/error.html', 'utf-8').replace('err_reason', err))).end();
  }

  serveAntimatterClient(req, res) {
    res.writeHead(200, { 'content-type': 'application/javascript' }); res.end(fs.readFileSync('./antimatter/antimatter.client.js')); }

  getProxyData(req) {
    const proxy = { host: (this.proxyURL(req).replace(/(https:\/\/|http:\/\/|\/$)/g, '')).split('/')[0], path: (this.proxyURL(req)).split('/')[(this.proxyURL(req)).split('/').length - 1], url: this.proxyURL(req), docTitle: this.config.docTitle };
    proxy.options = { headers: {}, method: req.method || 'GET' };
    if (req.headers['referer']) proxy.options['referer'] = req.headers['referer'];
    if (req.headers['origin']) proxy.options['origin'] = req.headers['origin'];
    proxy.spliceURL = new URL(proxy.url);
    return proxy;
  }

  createProxifyFunctions(proxy) {
    return {
      url: function (url) {
        var host = proxy.host;
        url = url.replace(/\/$/gi, '');
        if (url.match(/^(about:|javascript:|#|tel:|mailto:)/g)) return url;
        if (url.startsWith('http')) { url = proxy.prefix + btoa(url); } else if (url.startsWith('//')) { url = proxy.prefix + btoa(url.replace(/^\/{2}/gi, 'https://')); } else { url = proxy.prefix + btoa(searchEngine + url); }
        if (url === proxy.prefix + 'aHR0cHM6Ly9kaXNjb3JkLmNvbS8vZGlzY29yZC5jb20vbG9naW4=') { url = proxy.prefix + btoa(searchEngine + 'discord login'); }
        return url;
      },
      css: function (code) {
        var host = proxy.host;
        code = code.replace(/@import\s*url\(['"`](.*?)['"`]\);*/gmi, function (match, p1) {
          p1 = p1.replace(/['"`]/gi, '');
          return `@import url('${this.url(p1)}')`;
        });
        code = code.replace(/url\(['"`](.*?)['"`]\)/gi, function (match, p1, p2) {
          p1 = p1.replace(/['"`]/gi, '');
          return match.replace(p1, this.url(p1));
        });
        return code;
      },
      js: function (code) {
        return code.toString().replace(/location/g, 'sLocation').replace('myScript.src', '(myScript.src ? myScript.src : "")');
      },
      html: function (code) {
        code = code.toString().replace(/\s*onclick=["'`](.*)["'`]/gi, function (match, p1) {
          return match.replace(match, this.js(match));
        });
        code = code.replace(/<style.*>(.*?)<\/style>/gi, function (match, p1) {
          return match.replace(p1, this.css(p1));
        });
        code = code.replace(/<script.*>(.*?)<\/script>/gmi, function (match, p1) {
          return match.replace(p1, this.js(p1));
        });
        code = code.replace(/<a[^>]* href=["'](.*?)["']/gi, function (match, p1) {
          return match.replace(p1, this.url(p1));
        });
        code = code.replace(/<form[^>]* action=["'](.*?)["']/gi, function (match, p1) {
          return match.replace(p1, this.url(p1));
        });
        code = code.replace(/<link[^>]* href=["'](.*?)["']/gi, function (match, p1) {
          return match.replace(p1, this.url(p1));
        });
        code = code.replace(/<img[^>]* src=["'](.*?)["']/gi, function (match, p1) {
          return match.replace(p1, this.url(p1));
        });
        return code;
      }
    };
  }

  proxyURL(req) {
    return atob(req.url.replace(this.prefix, ''));
  }

  headersURL(url) {
    return atob(url.replace(this.prefix, ''));
  }
}

const prefix = '/search/';
const searchEngine = 'https://duckduckgo.com/?q=';

// Server setup
const port = 3000; // Change to your desired port number
const AntiMatterProxyServer = new AntiMatterProxy(prefix);
const server = http.createServer((req, res) => AntiMatterProxyServer.request(req, res));
server.listen(port, () => console.log(`Server running on port ${port}`));
