// scripts/copy-ffmpeg-worker.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const destDir = path.join(root, 'src', 'assets', 'ffmpeg');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const candidates = [
  path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm', 'ffmpeg-core.js'),
  path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm', 'ffmpeg-core.wasm'),
  path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm', 'ffmpeg-core.worker.js'),
];

let copied = false;

for (const src of candidates) {
  if (fs.existsSync(src)) {
    const dest = path.join(destDir, path.basename(src));
    fs.copyFileSync(src, dest);
    console.log('Copied', src, '->', dest);
    copied = true;
  }
}

if (!copied) {
  console.warn('No ffmpeg worker found to copy; skipping.');
}
