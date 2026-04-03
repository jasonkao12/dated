/**
 * Generates all mobile app icon PNG files.
 * Run from repo root: node --experimental-vm-modules scripts/generate-icons.mjs
 * Or: cd web && node ../scripts/generate-icons.mjs
 */

import { createRequire } from 'module'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// Load sharp from web/node_modules
const sharp = require(`${ROOT}/web/node_modules/sharp`)

const iconSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#734e97"/>
  <text x="512" y="736"
    font-family="Arial Black, Arial, Helvetica, sans-serif"
    font-weight="900" font-size="700" fill="#ffffff"
    text-anchor="middle" letter-spacing="-20">d</text>
</svg>`)

const splashSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#734e97"/>
  <text x="512" y="600"
    font-family="Arial Black, Arial, Helvetica, sans-serif"
    font-weight="900" font-size="700" fill="#ffffff"
    text-anchor="middle" letter-spacing="-20">d</text>
</svg>`)

const faviconSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect width="48" height="48" rx="10" fill="#734e97"/>
  <text x="24" y="36"
    font-family="Arial Black, Arial, Helvetica, sans-serif"
    font-weight="900" font-size="32" fill="#ffffff"
    text-anchor="middle">d</text>
</svg>`)

const out = `${ROOT}/mobile/assets/images`

await sharp(iconSvg).resize(1024, 1024).png().toFile(`${out}/icon.png`)
console.log('✓ icon.png')

await sharp(iconSvg).resize(1024, 1024).png().toFile(`${out}/adaptive-icon.png`)
console.log('✓ adaptive-icon.png')

await sharp(splashSvg).resize(1024, 1024).png().toFile(`${out}/splash-icon.png`)
console.log('✓ splash-icon.png')

await sharp(faviconSvg).resize(48, 48).png().toFile(`${out}/favicon.png`)
console.log('✓ favicon.png (mobile web export)')

console.log('\nDone. All mobile icons updated.')
