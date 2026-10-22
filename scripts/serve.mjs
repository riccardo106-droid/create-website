// Server statico minimo per misurare un sito con Lighthouse (che non accetta file://).
// Uso: node serve.mjs <cartella> [porta]   ->  http://127.0.0.1:<porta>/
// Comprime i testi in gzip come fa Netlify, cosi' il punteggio di Performance non esce
// peggiore del reale. Non e' un server di produzione: ascolta solo su 127.0.0.1.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve(process.argv[2] || ".");
const port = Number(process.argv[3] || 8123);

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".avif": "image/avif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff",
};
const GZIP = new Set([".html", ".css", ".js", ".json", ".svg", ".xml", ".txt"]);

http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(root, rel);
  if (!file.startsWith(root)) { res.writeHead(403).end("403"); return; }

  fs.readFile(file, (err, buf) => {
    if (err) {
      // Come su Netlify: 404.html se c'e', con status 404.
      const nf = path.join(root, "404.html");
      const body = fs.existsSync(nf) ? fs.readFileSync(nf) : Buffer.from("404");
      res.writeHead(404, { "Content-Type": MIME[".html"] }).end(body);
      return;
    }
    const ext = path.extname(file).toLowerCase();
    const headers = { "Content-Type": MIME[ext] || "application/octet-stream" };
    if (GZIP.has(ext) && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
      headers["Content-Encoding"] = "gzip";
      buf = zlib.gzipSync(buf);
    }
    res.writeHead(200, headers).end(buf);
  });
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} on http://127.0.0.1:${port}/`));
