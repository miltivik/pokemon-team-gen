/**
 * Downloads ability descriptions from Pokemon Showdown and saves as JSON.
 * Run with: node scripts/download-abilities.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const ABILITIES_URL = 'https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/text/abilities.ts';

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
    console.log('Downloading abilities text data...');
    const raw = await fetch(ABILITIES_URL);

    // Parse the TS file: extract each ability's name, desc, shortDesc
    const abilities = {};

    // Match each ability block
    const regex = /(\w+):\s*\{([^}]+)\}/g;
    let match;

    while ((match = regex.exec(raw)) !== null) {
        const id = match[1];
        const block = match[2];

        const nameMatch = block.match(/name:\s*"([^"]+)"/);
        const descMatch = block.match(/desc:\s*"([^"]+)"/);
        const shortDescMatch = block.match(/shortDesc:\s*"([^"]+)"/);

        if (nameMatch) {
            abilities[id] = {
                name: nameMatch[1],
                desc: descMatch ? descMatch[1] : '',
                shortDesc: shortDescMatch ? shortDescMatch[1] : (descMatch ? descMatch[1] : ''),
            };
        }
    }

    const count = Object.keys(abilities).length;
    console.log(`Parsed ${count} abilities.`);

    const outPath = path.join(__dirname, '..', 'data', 'abilities.json');
    fs.writeFileSync(outPath, JSON.stringify(abilities, null, 2));
    console.log(`Saved to ${outPath}`);
}

main().catch(console.error);
