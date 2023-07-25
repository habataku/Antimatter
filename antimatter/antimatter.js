const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const querystring = require('querystring');
const { JSDOM } = require('jsdom');
const https = require('https');
const request = require('request');

const btoa = str => Buffer.from(str).toString('base64');
const atob = str => Buffer.from(str, 'base64').toString('utf-8');

class AntiMatterProxy {
  constructor(prefix, config = {}) {
    this.prefix = prefix;
    this.config = config;
  }

  request(req, res) {
    if (req.url.replace(this.prefix, '') === 'antimatter') {
      res.writeHead(200, { 'content-type': 'application/javascript' });
      return res.end(fs.readFileSync('./antimatter/antimatter.client.js'));
    }

    const proxy = {
      host: (this.proxyURL(req).replace(/(https:\/\/|http:\/\/|\/$)/g, '')).split('/')[0],
      path: (this.proxyURL(req)).split('/')[(this.proxyURL(req)).split('/').length - 1],
      url: this.proxyURL(req),
      docTitle: this.config.docTitle
    };

    proxy.options = {
      headers: {},
      method: req.method || 'GET'
    };

    if (req.headers['referer']) proxy.options['referer'] = req.headers['referer'];

    if (req.headers['origin']) proxy.options['origin'] = req.headers['origin'];

    //if (req.headers['cookie']) proxy.options['cookie'] = req.headers['cookie']

    try {
      new URL(proxy.url);
    } catch (err) {
      return res.end('Invalid URL: ' + proxy.url + ', ' + err);
    }

    proxy.spliceURL = new URL(proxy.url);

    var inject = { url: proxy.url, prefix: this.prefix, host: proxy.host };

    if (proxy.options.headers['origin']) {
      var newHeader = this.headersURL(`/${proxy.options.headers['origin'].split('/').splice(3).join('/')}`.replace(this.prefix, ''), true);
      if (newHeader.startsWith('https://') || newHeader.startsWith('http://')) newHeader = newHeader.split('/').splice(0, 3).join('/');
      else newHeader = proxy.url;
      proxy.options.headers['origin'] = newHeader;
    }

    if (proxy.options.headers['referer']) {
      var proxified_header = this.headersURL(`/${proxy.options.headers['referer'].split('/').splice(3).join('/')}`.replace(this.prefix, ''), true);
      if (proxified_header.startsWith('https://') || proxified_header.startsWith('http://')) proxified_header = proxified_header;
      else proxified_header = proxy.url;
      proxy.options.headers['referer'] = proxified_header;
    }

    var requestProtocol = proxy.url.startsWith('https://') ? https : http;

    var requestMain = requestProtocol.request(this.proxyURL(req), proxy.options, response => {
      let pData = [];
      let sendData = '';
      response.on('data', (data) => { pData.push(data) }).on('end', () => {
        const proxify = {
          url: function (url) {
            var host = proxy.host;
            url = url.replace(/\/$/gi, '');
            //console.log(url)
            if (url.match(/^(about:|javascript:|#|tel:|mailto:)/g)) return url;
            if (url.startsWith('http')) {
              url = this.prefix + btoa(url);
            } else if (url.startsWith('//')) {
              url = this.prefix + btoa(url.replace(/^\/{2}/gi, 'https://'));
            } else {
              url = this.prefix + btoa(searchEngine + url);
            }
            if (url === this.prefix + 'aHR0cHM6Ly9kaXNjb3JkLmNvbS8vZGlzY29yZC5jb20vbG9naW4=') {
              url = this.prefix + btoa(searchEngine + 'discord login');
            }
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
            code = code.replace(regex, (match, p1, p2) => {
              if (p2 = p2.replace(/^\//gi, ''))
              if (p1 === 'srcset') {
                var arr = [];

                p2.split(',').forEach(url => {
                  url = url.trimStart().split(' ');
                  url[0] = this.url(url[0]);
                  arr.push(url.join(' '));
                });

                p2 = arr.join(', ');
                return;
              }
              if (p1 === 'integrity' || p1 === 'nonce') {
                return '';
              }
              let newUrl = 'https://example.com';
              if (p2.indexOf('https') !== -1) {
                newUrl = p2;
              } else if (p2.substr(0, 2) === '//') {
                newUrl = 'https:' + p2;
              } else {
                const searchURL = new URL(proxy.url);
                newUrl = '//' + searchURL.host + '/' + p2;
              }
              if (!p2.includes(proxy.host))
              if (p2.match(/^(#|about:|data:|blob:|mailto:|javascript:|\{|\*)/)) return match;
              if (proxy.url.startsWith('javascript:')) return 'javascript:'+this.js(poxy.url);
              match.replace(p2, this.url(p2));
              return ` ${p1}="${this.url(newUrl)}"`;
            });
            const html = new JSDOM(code, { contentType: 'text/html' }), document = html.window.document;
            document.querySelectorAll('*[style]').forEach(node => {
              node.style = this.css(node.getAttribute('style'));
            });
            var inject_script = document.createElement('script');inject_script.src = this.prefix + 'antimatter';inject_script.setAttribute('data-proxyConfig', JSON.stringify(inject));proxy.docTitle ? inject_script.setAttribute('data-docTitle', proxy.docTitle) : null;document.querySelector('head').insertBefore(inject_script, document.querySelector('head').childNodes[0]);
            code = html.serialize();
            return code;
          }
        };

        Object.entries(response.headers).forEach(([header_name, header_value]) => {
          if (header_name === 'set-cookie') {
            const cookie_array = [];
            header_value.forEach(cookie => cookie_array.push(cookie.replace(/Domain=(.*?);/gi, `Domain=` + req.headers['host'] + ';').replace(/(.*?)=(.*?);/, '$1' + '@' + proxy.spliceURL.hostname + `=` + '$2' + ';')));
            response.headers[header_name] = cookie_array;
          }

          if (header_name.startsWith('content-encoding') || header_name.startsWith('x-') || header_name.startsWith('cf-') || header_name.startsWith('strict-transport-security') || header_name.startsWith('content-security-policy') || header_name.startsWith('content-length')) delete response.headers[header_name];

          if (header_name === 'location') response.headers[header_name] = proxify.url(header_value);
        });

        sendData = Buffer.concat(pData);
        if (!response.headers['content-type']) {
          response.headers['content-type'] = 'text/plain; charset=UTF-8';
        }
        if (response.headers['content-type'].startsWith('text/html')) {
          sendData = proxify.html(sendData.toString());
        } else if (response.headers['content-type'].startsWith('application/javascript' || 'text/javascript')) {
          sendData = proxify.js(sendData.toString());
        } else if (response.headers['content-type'].startsWith('text/css')) {
          sendData = proxify.css(sendData.toString());
        }

        res.writeHead(response.statusCode, response.headers).end(sendData);
      });
    }).on('error', err => res.end(fs.readFileSync('./public/error.html', 'utf-8').replace('err_reason', err))).end();
  }

  post(req, res) {
    var url = atob(req.url.replace(this.prefix, ''));
    request.post(url, { json: req.body }, function (error, response, body) { response.on('end', () => res.end(body)) });
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

module.exports = class AntiMatterProxy {
  constructor(prefix, config = {}) {
    this.prefix = prefix;
    this.config = config;
  }

  request(req, res) {
    if (req.url.replace(this.prefix, '') === 'antimatter') {
      res.writeHead(200, { 'content-type': 'application/javascript' });
      return res.end(fs.readFileSync('./antimatter/antimatter.client.js'));
    }

    const proxy = {
      host: (this.proxyURL(req).replace(/(https:\/\/|http:\/\/|\/$)/g, '')).split('/')[0],
      path: (this.proxyURL(req)).split('/')[(this.proxyURL(req)).split('/').length - 1],
      url: this.proxyURL(req),
      docTitle: this.config.docTitle
    };

    proxy.options = {
      headers: {},
      method: req.method || 'GET'
    };

    if (req.headers['referer']) proxy.options['referer'] = req.headers['referer'];

    if (req.headers['origin']) proxy.options['origin'] = req.headers['origin'];

    try {
      new URL(proxy.url);
    } catch (err) {
      return res.end('Invalid URL: ' + proxy.url + ', ' + err);
    }

    proxy.spliceURL = new URL(proxy.url);

    var inject = { url: proxy.url, prefix: this.prefix, host: proxy.host };

    if (proxy.options.headers['origin']) {
      var newHeader = this.headersURL(`/${proxy.options.headers['origin'].split('/').splice(3).join('/')}`.replace(this.prefix, ''), true);
      if (newHeader.startsWith('https://') || newHeader.startsWith('http://')) newHeader = newHeader.split('/').splice(0, 3).join('/');
      else newHeader = proxy.url;
      proxy.options.headers['origin'] = newHeader;
    }

    if (proxy.options.headers['referer']) {
      var proxified_header = this.headersURL(`/${proxy.options.headers['referer'].split('/').splice(3).join('/')}`.replace(this.prefix, ''), true);
      if (proxified_header.startsWith('https://') || proxified_header.startsWith('http://')) proxified_header = proxified_header;
      else proxified_header = proxy.url;
      proxy.options.headers['referer'] = proxified_header;
    }

    var requestProtocol = proxy.url.startsWith('https://') ? https : http;

    var requestMain = requestProtocol.request(this.proxyURL(req), proxy.options, response => {
      let pData = [];
      let sendData = '';
      response.on('data', (data) => { pData.push(data) }).on('end', () => {
        const proxify = {
          url: function (url) {
            var host = proxy.host;
            url = url.replace(/\/$/gi, '');
            if (url.match(/^(about:|javascript:|#|tel:|mailto:)/g)) return url;
            if (url.startsWith('http')) {
              url = this.prefix + btoa(url);
            } else if (url.startsWith('//')) {
              url = this.prefix + btoa(url.replace(/^\/{2}/gi, 'https://'));
            } else {
              url = this.prefix + btoa(searchEngine + url);
            }
            if (url === this.prefix + 'aHR0cHM6Ly9kaXNjb3JkLmNvbS8vZGlzY29yZC5jb20vbG9naW4=') {
              url = this.prefix + btoa(searchEngine + 'discord login');
            }
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
            code = code.replace(regex, (match, p1, p2) => {
              if (p2 = p2.replace(/^\//gi, ''))
              if (p1 === 'srcset') {
                var arr = [];

                p2.split(',').forEach(url => {
                  url = url.trimStart().split(' ');
                  url[0] = this.url(url[0]);
                  arr.push(url.join(' '));
                });

                p2 = arr.join(', ');
                return;
              }
              if (p1 === 'integrity' || p1 === 'nonce') {
                return '';
              }
              let newUrl = 'https://example.com';
              if (p2.indexOf('https') !== -1) {
                newUrl = p2;
              } else if (p2.substr(0, 2) === '//') {
                newUrl = 'https:' + p2;
              } else {
                const searchURL = new URL(proxy.url);
                newUrl = '//' + searchURL.host + '/' + p2;
              }
              if (!p2.includes(proxy.host))
              if (p2.match(/^(#|about:|data:|blob:|mailto:|javascript:|\{|\*)/)) return match;
              if (proxy.url.startsWith('javascript:')) return 'javascript:'+this.js(poxy.url);
              match.replace(p2, this.url(p2));
              return ` ${p1}="${this.url(newUrl)}"`;
            });
            const html = new JSDOM(code, { contentType: 'text/html' }), document = html.window.document;
            document.querySelectorAll('*[style]').forEach(node => {
              node.style = this.css(node.getAttribute('style'));
            });
            var inject_script = document.createElement('script');inject_script.src = this.prefix + 'antimatter';inject_script.setAttribute('data-proxyConfig', JSON.stringify(inject));proxy.docTitle ? inject_script.setAttribute('data-docTitle', proxy.docTitle) : null;document.querySelector('head').insertBefore(inject_script, document.querySelector('head').childNodes[0]);
            code = html.serialize();
            return code;
          }
        };

        Object.entries(response.headers).forEach(([header_name, header_value]) => {
          if (header_name === 'set-cookie') {
            const cookie_array = [];
            header_value.forEach(cookie => cookie_array.push(cookie.replace(/Domain=(.*?);/gi, `Domain=` + req.headers['host'] + ';').replace(/(.*?)=(.*?);/, '$1' + '@' + proxy.spliceURL.hostname + `=` + '$2' + ';')));
            response.headers[header_name] = cookie_array;
          }

          if (header_name.startsWith('content-encoding') || header_name.startsWith('x-') || header_name.startsWith('cf-') || header_name.startsWith('strict-transport-security') || header_name.startsWith('content-security-policy') || header_name.startsWith('content-length')) delete response.headers[header_name];

          if (header_name === 'location') response.headers[header_name] = proxify.url(header_value);
        });

        sendData = Buffer.concat(pData);
        if (!response.headers['content-type']) {
          response.headers['content-type'] = 'text/plain; charset=UTF-8';
        }
        if (response.headers['content-type'].startsWith('text/html')) {
          sendData = proxify.html(sendData.toString());
        } else if (response.headers['content-type'].startsWith('application/javascript' || 'text/javascript')) {
          sendData = proxify.js(sendData.toString());
        } else if (response.headers['content-type'].startsWith('text/css')) {
          sendData = proxify.css(sendData.toString());
        }

        res.writeHead(response.statusCode, response.headers).end(sendData);
      });
    }).on('error', err => res.end(fs.readFileSync('./public/error.html', 'utf-8').replace('err_reason', err))).end();
  }

  post(req, res) {
    var url = atob(req.url.replace(this.prefix, ''));
    request.post(url, { json: req.body }, function (error, response, body) { response.on('end', () => res.end(body)) });
  }

  proxyURL(req) {
    return atob(req.url.replace(this.prefix, ''));
  }

  headersURL(url) {
    return atob(url.replace(this.prefix, ''));
  }
};

// Server setup
const port = 3000; // Change to your desired port number
const AntiMatterProxyServer = new AntiMatterProxy(prefix);
const server = http.createServer((req, res) => AntiMatterProxyServer.request(req, res));
server.listen(port, () => console.log(`Server running on port ${port}`));
