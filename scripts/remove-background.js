/**
 * Script para eliminar el fondo de las imágenes de logo
 * Uso: node scripts/remove-background.js
 * 
 * - logo-dark.png: elimina fondo negro
 * - logo-white.png: elimina fondo blanco
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');

// Función para eliminar el fondo basado en el color especificado
async function removeBackground(inputPath, outputPath, bgColor = 'white') {
    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        console.log(`Procesando: ${path.basename(inputPath)}`);
        console.log(`  Dimensiones: ${metadata.width}x${metadata.height}`);
        console.log(`  Eliminando fondo: ${bgColor}`);

        // Leer la imagen como raw pixels
        const { data, info } = await image
            .removeAlpha() // Eliminar canal alpha existente si lo hay
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Crear nuevo buffer con alpha
        const outputData = Buffer.alloc(info.width * info.height * 4);

        for (let i = 0; i < info.width * info.height; i++) {
            const r = data[i * 3];
            const g = data[i * 3 + 1];
            const b = data[i * 3 + 2];

            outputData[i * 4] = r;
            outputData[i * 4 + 1] = g;
            outputData[i * 4 + 2] = b;

            let isBackground = false;

            if (bgColor === 'black') {
                // Eliminar fondo negro (r, g, b todos menores a 30)
                isBackground = r < 30 && g < 30 && b < 30;
            } else if (bgColor === 'white') {
                // Eliminar fondo blanco (r, g, b todos mayores a 240)
                isBackground = r > 240 && g > 240 && b > 240;
            }

            // Hacer transparente si es fondo
            if (isBackground) {
                outputData[i * 4 + 3] = 0; // Transparente
            } else {
                outputData[i * 4 + 3] = 255; // Opaco
            }
        }

        // Guardar imagen con transparencia
        await sharp(outputData, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4
            }
        })
            .png()
            .toFile(outputPath);

        console.log(`  ✓ Guardado: ${path.basename(outputPath)}`);
        return true;
    } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        return false;
    }
}

// Función principal
async function main() {
    console.log('=== Eliminador de fondo de imágenes ===\n');

    // Verificar que existe la carpeta icons
    if (!fs.existsSync(ICONS_DIR)) {
        console.error(`Error: No se encontró la carpeta ${ICONS_DIR}`);
        process.exit(1);
    }

    // Procesar logo-dark.png (eliminar fondo negro)
    const logoDarkInput = path.join(ICONS_DIR, 'logo-dark.png');
    const logoDarkOutput = path.join(ICONS_DIR, 'logo-dark-nobg.png');

    if (fs.existsSync(logoDarkInput)) {
        await removeBackground(logoDarkInput, logoDarkOutput, 'black');
    } else {
        console.log(`No se encontró: ${logoDarkInput}`);
    }

    // Procesar logo-white.png (eliminar fondo blanco)
    const logoWhiteInput = path.join(ICONS_DIR, 'logo-white.png');
    const logoWhiteOutput = path.join(ICONS_DIR, 'logo-white-nobg.png');

    if (fs.existsSync(logoWhiteInput)) {
        await removeBackground(logoWhiteInput, logoWhiteOutput, 'white');
    } else {
        console.log(`No se encontró: ${logoWhiteInput}`);
    }

    console.log('\n=== Proceso completado ===');
}

main().catch(console.error);
