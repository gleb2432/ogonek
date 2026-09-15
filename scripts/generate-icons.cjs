const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');

async function generate() {
  const svg = fs.readFileSync(svgPath);
  
  await sharp(svg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
    
  await sharp(svg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
    
  // Maskable icon (with some padding, although our SVG already has padding, we just copy it)
  await sharp(svg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
    
  // Apple touch icon (180x180 png)
  await sharp(svg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
  console.log('Icons generated successfully.');
}

generate().catch(console.error);
