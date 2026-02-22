const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '../data');
const URLS = {
    'pokedex.json': 'https://play.pokemonshowdown.com/data/pokedex.json',
    'learnsets.json': 'https://play.pokemonshowdown.com/data/learnsets.json',
    'formats.js': 'https://play.pokemonshowdown.com/data/formats.js'
};

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

Object.entries(URLS).forEach(([filename, url]) => {
    const filePath = path.join(DATA_DIR, filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${filename}`);
        });
    }).on('error', (err) => {
        fs.unlink(filePath, () => { }); // Delete the file async. (But we don't check result)
        console.error(`Error downloading ${filename}: ${err.message}`);
    });
});
