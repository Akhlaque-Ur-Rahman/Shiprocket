'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'public');

const skipDirs = new Set([
  'node_modules',
  '.git',
  'public',
  '.cursor',
  'scripts',
  'migrations',
  'docs',
]);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
  if (ent.name.startsWith('.')) continue;
  if (skipDirs.has(ent.name)) continue;
  const full = path.join(root, ent.name);
  if (ent.isDirectory()) {
    if (ent.name === 'assets') copyDir(full, path.join(out, 'assets'));
    continue;
  }
  if (!ent.isFile()) continue;
  const ext = path.extname(ent.name);
  if (ext === '.html' || ext === '.css' || ext === '.js') {
    fs.copyFileSync(full, path.join(out, ent.name));
  }
}
