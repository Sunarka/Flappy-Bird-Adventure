const sharp = require('sharp');
const path = require('path');

const inputPath = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\21b4b7a1-ed13-4c20-a399-76d04bdad6c7\\.user_uploaded\\media_1788508692298.jpg';
const outputPath = path.join(__dirname, 'pak_vramroro.png');

const TARGET_SIZE = 256;
const cx = 510;
const cy = 416;
const r = 366;

const left = Math.max(0, Math.round(cx - r));
const top = Math.max(0, Math.round(cy - r));
const size = Math.round(r * 2);

const maskSvg = Buffer.from(
  `<svg width="${TARGET_SIZE}" height="${TARGET_SIZE}"><circle cx="${TARGET_SIZE/2}" cy="${TARGET_SIZE/2}" r="${TARGET_SIZE/2}" fill="#fff"/></svg>`
);

sharp(inputPath)
  .extract({ left, top, width: size, height: size })
  .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'fill' })
  .composite([{ input: maskSvg, blend: 'dest-in' }])
  .png({ quality: 100 })
  .toFile(outputPath)
  .then(() => {
    console.log('✅ Created assets/avatars/pak_vramroro.png');
  })
  .catch(err => {
    console.error('❌ Error creating avatar:', err);
  });

