/**
 * Crop ava.jpg sprite sheet (4x2 grid) menjadi 8 avatar PNG individual
 * Menggunakan sharp (akan diinstall otomatis)
 * 
 * Layout ava.jpg:
 * [Luffy][Naruto][Tanjiro][Nezuko]   <- baris 1
 * [Gojo ][Goku  ][Levi   ][Anya  ]   <- baris 2
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const INPUT = path.join(__dirname, '..', '..', 'C:/Users/User/.gemini/antigravity/brain/21b4b7a1-ed13-4c20-a399-76d04bdad6c7/.user_uploaded/media_1788491446253.jpg');
const INPUT_ABS = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\21b4b7a1-ed13-4c20-a399-76d04bdad6c7\\.user_uploaded\\media_1788491446253.jpg';
const OUTPUT_DIR = __dirname;

// Install sharp kalau belum ada
try {
  require.resolve('sharp');
  console.log('sharp sudah ada ✅');
} catch {
  console.log('Menginstall sharp...');
  execSync('npm install sharp --save-dev 2>&1', { cwd: path.join(__dirname, '../..'), stdio: 'inherit' });
}

const sharp = require('sharp');

const AVATARS = [
  // [name, col, row]
  ['luffy_mugiwara',  0, 0],
  ['naruto_sage',     1, 0],
  ['tanjiro_slayer',  2, 0],
  ['nezuko_chan',     3, 0],
  ['gojo_satoru',     0, 1],
  ['goku_saiyan',     1, 1],
  ['levi_scout',      2, 1],
  ['anya_forger',     3, 1],
];

async function cropAvatars() {
  const meta = await sharp(INPUT_ABS).metadata();
  const { width: W, height: H } = meta;
  console.log(`Image size: ${W}x${H}`);

  const COLS = 4;
  const ROWS = 2;
  const cellW = Math.floor(W / COLS);
  const cellH = Math.floor(H / ROWS);
  const PAD = 8; // padding dari tepi hitam
  const TARGET = 200; // output size

  console.log(`Cell size: ${cellW}x${cellH}`);

  for (const [name, col, row] of AVATARS) {
    const left = col * cellW + PAD;
    const top  = row * cellH + PAD;
    const cropW = cellW - PAD * 2;
    const cropH = cellH - PAD * 2;

    const outPath = path.join(OUTPUT_DIR, `${name}.png`);
    
    await sharp(INPUT_ABS)
      .extract({ left, top, width: cropW, height: cropH })
      .resize(TARGET, TARGET, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 8 })
      .toFile(outPath);

    console.log(`✅ ${name}.png`);
  }

  console.log('\n🎉 Semua avatar berhasil di-crop!');
  console.log('Output:', OUTPUT_DIR);
}

cropAvatars().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
