const fs = require('fs');
const path = require('path');

// Carrega .env local caso exista (na Vercel usa process.env.GTM_ID direto do painel)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = (match[2] || '').replace(/^['"]|['"]$/g, '').trim();
    }
  });
}

const GTM_ID = process.env.GTM_ID || '';
const DIST_DIR = path.join(__dirname, 'dist');

function copyRecursiveSync(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((child) => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Limpa e recria a pasta dist/
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Processa os arquivos HTML injetando GTM_ID da variável de ambiente da Vercel
const htmlFiles = ['index.html', 'neres.html', 'crown.html'];
htmlFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/__GTM_ID__/g, GTM_ID);
    fs.writeFileSync(path.join(DIST_DIR, file), content, 'utf-8');
  }
});

// Copia style.css e assets/
fs.copyFileSync(path.join(__dirname, 'style.css'), path.join(DIST_DIR, 'style.css'));
copyRecursiveSync(path.join(__dirname, 'assets'), path.join(DIST_DIR, 'assets'));

console.log(`✅ Build concluído em dist/ (GTM_ID configurado: ${GTM_ID ? 'SIM' : 'NÃO DEFINIDO'})`);
