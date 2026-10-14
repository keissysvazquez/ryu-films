import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project = fileURLToPath(new URL('../', import.meta.url));
const root = path.resolve(project, process.argv[2] || 'dist');
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || 3000);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.jpeg':'image/jpeg', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.mp4':'video/mp4', '.webm':'video/webm', '.woff2':'font/woff2', '.zip':'application/zip' };
await stat(path.join(root, 'index.html')).catch(() => { console.error('Missing site files. Run npm run build before previewing production.'); process.exit(1); });
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, {Allow:'GET, HEAD'}); return res.end(); }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    let info = await stat(file);
    if (info.isDirectory()) { file = path.join(file, 'index.html'); info = await stat(file); }
    if (!info.isFile()) throw new Error('Not a file');
    const headers = {'Content-Type':mime[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-cache', 'Accept-Ranges':'bytes'};
    let start = 0, end = info.size - 1, status = 200;
    if (req.headers.range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!m || (!m[1] && !m[2])) { res.writeHead(416, {'Content-Range':`bytes */${info.size}`}); return res.end(); }
      if (!m[1]) start = Math.max(0, info.size - Number(m[2]));
      else { start = Number(m[1]); if (m[2]) end = Math.min(end, Number(m[2])); }
      if (start > end || start >= info.size) { res.writeHead(416, {'Content-Range':`bytes */${info.size}`}); return res.end(); }
      status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length'] = Math.max(0, end - start + 1);
    res.writeHead(status, headers);
    if (req.method === 'HEAD' || !info.size) return res.end();
    createReadStream(file, {start,end}).on('error', () => res.destroy()).pipe(res);
  } catch { res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not found'); }
});
server.on('error', e => { console.error(e.code === 'EADDRINUSE' ? 'Port in use. Try npm run dev -- --port 3001' : e.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`RYU Films: http://localhost:${port}`));
