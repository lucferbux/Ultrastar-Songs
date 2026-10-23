// Renders the PWA / Apple icons from the SVG sources. Run after editing the artwork:
//   npm run icons
import { readFileSync } from 'node:fs'
import sharp from 'sharp'

const rounded = readFileSync('public/icon.svg') // transparent corners: favicon, "any" purpose
const full = readFileSync('design/icon-full.svg') // full bleed: iOS and maskable masks crop it

const outputs: [Buffer, number, string][] = [
  [full, 180, 'public/apple-touch-icon.png'],
  [rounded, 192, 'public/icon-192.png'],
  [rounded, 512, 'public/icon-512.png'],
  [full, 512, 'public/icon-maskable-512.png'],
  [rounded, 64, 'public/favicon-64.png'],
]

for (const [svg, size, file] of outputs) {
  await sharp(svg, { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toFile(file)
  console.log(`${file} (${size}px)`)
}
