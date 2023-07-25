const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const mime = require("mime");
const fs = require("fs");
const btoa = e => Buffer.from(e).toString("base64");
const atob = e => Buffer.from(e, "base64").toString("utf-8");

const getMimeType = e => (-1 !== e.indexOf("?") ? e.split("?")[0] : mime.getType(e) || "text/html");

const config = require("./config.json");
const prefix = config.prefix.includes("/", 2) ? config.prefix : prefix.replace("/", "");

const {
    port,
    blockedHosts,
    title,
    blockedIp
} = require("./config.json");

const AntiMatterProxy = require("./antimatter");

const proxy = new AntiMatterProxy(prefix, {
    hostBlock: blockedHosts,
    docTitle: title
});

const app = express()
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .get("*", (req, res) => {
        if (req.headers.useragent === 'googlebot') {
            res.writeHead(403).end();
            return;
        }

        if (req.url.startsWith(prefix + "search/query")) {
            if (!req.query.url.startsWith('http')) {
                req.query.url = 'https://duckduckgo.com/?q=' + req.query.url;
            }
            if (new URL(req.query.url)) {
                res.redirect(prefix + btoa(req.query.url));
            } else if (atob(req.query.url)) {
                res.redirect(prefix + btoa(req.query.url));
            } else {
                res.end("URL Parse Error");
            }
        } else {
            if (req.url.startsWith(prefix)) {
                proxy.request(req, res);
            } else {
                if (req.url === "/") {
                    res.writeHead(200, { "content-type": "text/html" });
                    res.end(fs.readFileSync("./public/index.html"));
                } else {
                    const filePath = "./public" + req.url;
                    if (!fs.existsSync(filePath)) {
                        res.end(fs.readFileSync("./public/error.html", "utf-8").replace("err_reason", 'File Not Found, "' + filePath.replace(/^\.\/public\//gm, "") + '"'));
                    } else {
                        res.sendFile(req.url, { root: "./public" });
                    }
                }
            }
        }
    })
    .post('*', (req, res) => {
        if (req.headers.useragent === 'googlebot') {
            res.writeHead(403).end();
            return;
        }

        if (req.url.startsWith(prefix)) {
            proxy.post(req, res);
        }
    });

const expressWs = require('express-ws')(app);

app.ws('*', (ws, req) => {});

app.listen(process.env.PORT || port, () => {
    console.log('https://localhost:' + port);
});
