/**
 * Script pour générer les icons PWA à partir du SVG
 * Usage: node scripts/generate-icons.mjs
 */

import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

const sizes = [192, 512]
const svgPath = join(rootDir, 'public', 'icons', 'icon.svg')
const outputDir = join(rootDir, 'public', 'icons')

async function generateIcons() {
  console.log('Generating PWA icons...')

  const svgBuffer = readFileSync(svgPath)

  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}.png`)

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath)

    console.log(`✓ Generated icon-${size}.png`)
  }

  // Generate favicon
  const faviconPath = join(rootDir, 'public', 'favicon.ico')
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFile(faviconPath.replace('.ico', '.png'))
  console.log('✓ Generated favicon.png (rename to favicon.ico if needed)')

  // Generate apple-touch-icon
  const applePath = join(outputDir, 'apple-touch-icon.png')
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(applePath)
  console.log('✓ Generated apple-touch-icon.png')

  console.log('\nDone! Icons generated successfully.')
}

generateIcons().catch(console.error)
