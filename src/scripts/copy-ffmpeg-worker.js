const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../node_modules/@ffmpeg/ffmpeg/dist/esm');
const dest = path.join(__dirname, '../src/assets/ffmpeg');

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

['worker.js', 'const.js', 'errors.js'].forEach(file => {
  const from = path.join(src, file);
  const to = path.join(dest, file);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    console.log(`[ffmpeg-setup] Copied ${file} → src/assets/ffmpeg/`);
  } else {
    console.warn(`[ffmpeg-setup] WARNING: ${file} not found in node_modules`);
  }
});