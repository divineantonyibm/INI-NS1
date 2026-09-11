import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { generateIndexHtml } from './generate-index.mjs';

const PORT = process.env.PORT || 3000;
const ROOT = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// Initial build of index.html
generateIndexHtml(ROOT);

// Watch current directory for HTML changes to live-rebuild index.html
fs.watch(ROOT, (eventType, filename) => {
  if (filename && filename.endsWith('.html') && filename !== 'index.html') {
    generateIndexHtml(ROOT);
  }
});

const server = http.createServer((req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    }

    const safePath = path.normalize(path.join(ROOT, pathname));

    // Security check: ensure path stays within ROOT
    if (!safePath.startsWith(ROOT)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(safePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><body><h1>404 Not Found</h1><p>File not found: ${escapeHtml(pathname)}</p><p><a href="/">Return to Index</a></p></body></html>`);
        return;
      }

      const ext = path.extname(safePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });

      fs.createReadStream(safePath).pipe(res);
    });
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error: ' + err.message);
  }
});

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

server.listen(PORT, () => {
  console.log(`\n🚀 INI-NS1 Docs Dev Server is running at:\n`);
  console.log(`   ➜ Local:   http://localhost:${PORT}/`);
  console.log(`\nWatching for changes to HTML files...\n`);
});
