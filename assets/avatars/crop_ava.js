const sharp = require('sharp');
const path = require('path');

const INPUT_ABS = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\21b4b7a1-ed13-4c20-a399-76d04bdad6c7\\.user_uploaded\\media_1788491446253.jpg';
const OUTPUT_DIR = __dirname;

const BADGES = [
  // Row 1
  { name: 'luffy_mugiwara', cx: 147, cy: 187, r: 118 },
  { name: 'naruto_sage',    cx: 388, cy: 187, r: 118 },
  { name: 'tanjiro_slayer', cx: 633, cy: 187, r: 118 },
  { name: 'nezuko_chan',    cx: 877, cy: 187, r: 118 },
  // Row 2
  { name: 'gojo_satoru',    cx: 147, cy: 460, r: 118 },
  { name: 'goku_saiyan',    cx: 388, cy: 460, r: 118 },
  { name: 'levi_scout',     cx: 634, cy: 460, r: 118 },
  { name: 'anya_forger',    cx: 877, cy: 460, r: 118 },
];

async function generatePerfectAvatars() {
  const TARGET_SIZE = 256;
  const maskSvg = Buffer.from(
    `<svg width="${TARGET_SIZE}" height="${TARGET_SIZE}"><circle cx="${TARGET_SIZE/2}" cy="${TARGET_SIZE/2}" r="${TARGET_SIZE/2}" fill="#fff"/></svg>`
  );

  for (const b of BADGES) {
    const size = Math.round(b.r * 2);
    const left = Math.round(b.cx - b.r);
    const top  = Math.round(b.cy - b.r);
    
    const outPath = path.join(OUTPUT_DIR, `${b.name}.png`);
    
    await sharp(INPUT_ABS)
      .extract({ left, top, width: size, height: size })
      .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'fill' })
      .composite([{ input: maskSvg, blend: 'dest-in' }])
      .png({ quality: 100 })
      .toFile(outPath);
      
    console.log(`✅ Perfect badge created: ${b.name}.png`);
  }
}

generatePerfectAvatars().catch(console.error);
