
const fs = require('fs');

async function testFetch() {
    // Test 1: Smogon Stats
    console.log('--- Testing Smogon Stats ---');
    try {
        const smogonUrl = 'https://www.smogon.com/stats/2024-11/gen9ou-0.txt'; // Use a known date
        const res = await fetch(smogonUrl);
        if (res.ok) {
            const text = await res.text();
            console.log(`Smogon stats length: ${text.length}`);
            fs.writeFileSync('smogon_stats.txt', text.substring(0, 1000));
        } else {
            console.log(`Smogon failed: ${res.status}`);
        }
    } catch (e) {
        console.error('Smogon fetch error:', e);
    }

    // Test 2: Pikalytics via Proxy
    console.log('\n--- Testing Pikalytics Proxy ---');
    const format = 'gen9ou';
    const pokemon = 'dragapult';
    const targetUrl = `https://pikalytics.com/pokedex/${format}/${pokemon}`;
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(targetUrl);

    try {
        const response = await fetch(proxyUrl);
        const text = await response.text();
        console.log(`Proxy response length: ${text.length}`);

        try {
            const data = JSON.parse(text);
            if (data.contents) {
                console.log(`Received Pikalytics HTML length: ${data.contents.length}`);
                fs.writeFileSync('pikalytics_dump.html', data.contents);
            } else {
                console.log('No contents field in JSON');
                console.log('Preview:', text.substring(0, 200));
            }
        } catch (jsonErr) {
            console.log('Response is not JSON.');
            console.log('Preview:', text.substring(0, 200));
        }

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

testFetch();
