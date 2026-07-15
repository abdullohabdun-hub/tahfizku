import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.join(process.cwd(), 'public', 'favicon.svg');
const svgBuffer = fs.readFileSync(svgPath);

const sizes = [
  { name: 'logo192.png', size: 192 },
  { name: 'logo512.png', size: 512 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'pwa-512x512-maskable.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generate() {
  for (const { name, size } of sizes) {
    const dest = path.join(process.cwd(), 'public', name);
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(dest);
      console.log(`Generated ${name} (${size}x${size})`);
    } catch (e) {
      console.error(`Failed to generate ${name}:`, e.message);
    }
  }
}

generate();
