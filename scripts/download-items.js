/**
 * Downloads item descriptions from Pokemon Showdown and saves as JSON.
 * Run with: node scripts/download-items.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const ITEMS_URL = 'https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/text/items.ts';

function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        });
    });
}

async function main() {
    console.log('Downloading items text data...');
    const raw = await fetch(ITEMS_URL);

    // Parse the TS file: extract each item's name, desc, shortDesc
    const items = {};

    // Match each item block
    const regex = /(\w+):\s*\{([^}]+)\}/g;
    let match;

    while ((match = regex.exec(raw)) !== null) {
        const id = match[1];
        const block = match[2];

        const nameMatch = block.match(/name:\s*"([^"]+)"/);
        const descMatch = block.match(/desc:\s*"([^"]+)"/);
        const shortDescMatch = block.match(/shortDesc:\s*"([^"]+)"/);

        if (nameMatch) {
            items[id] = {
                name: nameMatch[1],
                desc: descMatch ? descMatch[1] : '',
                shortDesc: shortDescMatch ? shortDescMatch[1] : (descMatch ? descMatch[1] : ''),
            };
        }
    }

    const count = Object.keys(items).length;
    console.log(`Parsed ${count} items.`);

    const outPath = path.join(__dirname, '..', 'data', 'items.json');
    fs.writeFileSync(outPath, JSON.stringify(items, null, 2));
    console.log(`Saved to ${outPath}`);
}

main().catch(console.error);
