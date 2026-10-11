'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.env.PORT) || 8766;
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf','.md':'text/plain; charset=utf-8','.json':'application/json'};
const server = http.createServer((req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); res.end('Archivo no encontrado.'); return;
    }
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache'});
    fs.createReadStream(file).pipe(res);
  } catch {
    res.writeHead(400, {'Content-Type':'text/plain; charset=utf-8'}); res.end('Solicitud no válida.');
  }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'El puerto está ocupado. Prueba PORT=8767 npm start.' : error.message); process.exit(1); });
server.listen(port, '127.0.0.1', () => console.log(`Agendatepy Glassy: http://127.0.0.1:${port}\nCtrl+C para cerrar el servidor.`));
