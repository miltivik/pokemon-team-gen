
const fs = require('fs');

async function testSmogonMoveset() {
    // Try latest available data (e.g. Nov 2024 or similar, based on current real time 2026-02-11 but Smogon archives might lag or be different)
    // The user suggested 2025-12 (future relative to 2024, past relative to 2026).
    // Let's try to find a valid URL.
    // Standard format: https://www.smogon.com/stats/YYYY-MM/moveset/gen9ou-0.txt

    // I'll try a few dates to be sure.
    const dates = ['2025-12', '2025-01', '2024-12', '2024-11'];

    for (const date of dates) {
        const url = `https://www.smogon.com/stats/${date}/moveset/gen9ou-0.txt`;
        console.log(`Trying: ${url}`);
        try {
            const res = await fetch(url);
            if (res.ok) {
                console.log(`Success! Found data for ${date}`);
                const text = await res.text();
                // Save a sample
                fs.writeFileSync('smogon_moveset_sample.txt', text.substring(0, 5000));
                console.log('Saved 5000 chars to smogon_moveset_sample.txt');

                // Let's print a bit to console to see structure
                console.log(text.substring(0, 500));
                return;
            } else {
                console.log(`Failed: ${res.status}`);
            }
        } catch (e) {
            console.error('Error fetching:', e);
        }
    }
}

testSmogonMoveset();
