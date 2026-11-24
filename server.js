const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);

  // Suporte a rotas limpas igual à Vercel (/neres -> neres.html, /crown -> crown.html)
  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 - Página não encontrada');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = ['127.0.0.1'];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

function startServer(port) {
  const onError = (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Porta ${port} ocupada, tentando porta ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Erro no servidor:', err);
    }
  };

  server.once('error', onError);

  server.listen(port, '0.0.0.0', () => {
    server.removeListener('error', onError);
    const ips = getLocalIPs();
    console.log(`\n🚀 Servidor local rodando em todos os IPs (0.0.0.0:${port})!`);
    ips.forEach((ip) => {
      console.log(`\n🌐 Pelo IP ${ip}:`);
      console.log(`   👉 Growth (Principal): http://${ip}:${port}/`);
      console.log(`   👉 Neres Brasil:       http://${ip}:${port}/neres`);
      console.log(`   👉 Crown Training:     http://${ip}:${port}/crown`);
    });
    console.log('');
  });
}

startServer(Number(PORT));
