/**
 * Script to generate a multi-size ICO favicon from a source image
 * 
 * Usage: node scripts/generate-favicon.js
 * 
 * This script reads the source image from public/icons/logo-dark-nobg.png
 * and generates a favicon.ico with multiple sizes (16, 32, 48, 256)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICO_SIZES = [16, 32, 48];
const PNG_SIZES = [
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 16, name: 'favicon-16x16.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' }
];

const SOURCE_PATH = path.join(__dirname, '..', 'public', 'icons', 'logo-dark-nobg.png');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ICO_OUTPUT_PATH = path.join(PUBLIC_DIR, 'favicon.ico');

async function generateFavicon() {
    console.log('🎨 Generating standard favicons...');

    // Check if source exists
    if (!fs.existsSync(SOURCE_PATH)) {
        console.error(`❌ Source image not found: ${SOURCE_PATH}`);
        console.log('Please ensure public/icons/logo-dark-nobg.png exists');
        process.exit(1);
    }

    try {
        // 1. Generate PNG files
        console.log('🖼️ Generating PNG icons...');
        await Promise.all(
            PNG_SIZES.map(async ({ size, name }) => {
                const outputPath = path.join(PUBLIC_DIR, name);
                await sharp(SOURCE_PATH)
                    .trim() // Remove transparent margins to ensure perfect centering
                    .resize(size, size, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .png()
                    .toFile(outputPath);
                console.log(`   ✅ ${name} (${size}x${size})`);
            })
        );

        // 2. Generate ICO file
        console.log('📦 Generating multi-size ICO...');
        const pngBuffers = await Promise.all(
            ICO_SIZES.map(size => {
                // Remove padding for better visibility in small sizes
                return sharp(SOURCE_PATH)
                    .trim() // Remove transparent margins to ensure perfect centering
                    .resize(size, size, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .png()
                    .toBuffer();
            })
        );

        const numImages = pngBuffers.length;
        const headerSize = 6;
        const dirEntrySize = 16;
        const dirSize = dirEntrySize * numImages;

        let offset = headerSize + dirSize;
        const offsets = pngBuffers.map(buf => {
            const currentOffset = offset;
            offset += buf.length;
            return currentOffset;
        });

        const icoBuffer = Buffer.alloc(headerSize + dirSize + pngBuffers.reduce((a, b) => a + b.length, 0));

        icoBuffer.writeUInt16LE(0, 0);        // Reserved
        icoBuffer.writeUInt16LE(1, 2);        // Type: 1 = ICO
        icoBuffer.writeUInt16LE(numImages, 4); // Number of images

        let pos = headerSize;
        pngBuffers.forEach((buf, i) => {
            const size = ICO_SIZES[i];
            const icoSize = size >= 256 ? 0 : size;
            icoBuffer.writeUInt8(icoSize, pos);
            icoBuffer.writeUInt8(icoSize, pos + 1);
            icoBuffer.writeUInt8(0, pos + 2);
            icoBuffer.writeUInt8(0, pos + 3);
            icoBuffer.writeUInt16LE(1, pos + 4);
            icoBuffer.writeUInt16LE(32, pos + 6);
            icoBuffer.writeUInt32LE(buf.length, pos + 8);
            icoBuffer.writeUInt32LE(offsets[i], pos + 12);
            pos += dirEntrySize;
        });

        pngBuffers.forEach((buf, i) => {
            buf.copy(icoBuffer, offsets[i]);
        });

        fs.writeFileSync(ICO_OUTPUT_PATH, icoBuffer);
        console.log(`   ✅ favicon.ico (${ICO_SIZES.join(', ')})`);

        console.log('\n✨ Favicons generated successfully!');
        console.log(`💾 Total files: ${PNG_SIZES.length + 1}`);

    } catch (error) {
        console.error('❌ Error generating favicon:', error.message);
        process.exit(1);
    }
}

generateFavicon();
