import fs from 'fs';
import { getSmogonStats } from '../lib/smogon-stats';

async function testParsing() {
    try {
        console.log('Starting parse test...');
        const data = await getSmogonStats('gen9vgc2026f');
        console.log(`Parsed ${Object.keys(data).length} mons.`);

        const sampleMon = 'Great Tusk';
        if (data[sampleMon.toLowerCase()]) {
            console.log(`\nData for ${sampleMon}:`);
            const mon = data[sampleMon.toLowerCase()];
            console.log('Raw Count:', mon.rawCount);
            console.log('Top Abilities:', Object.keys(mon.abilities).slice(0, 3));
            console.log('Top Items:', Object.keys(mon.items).slice(0, 3));
            console.log('Top Moves:', Object.keys(mon.moves).slice(0, 5));
            console.log('Top Teammates:', Object.keys(mon.teammates).slice(0, 5));
            console.log('Checks:', Object.keys(mon.checks).slice(0, 3));
        } else {
            console.error(`Could not find ${sampleMon} in parsed data.`);
            console.log('Available keys:', Object.keys(data).slice(0, 10));
        }
    } catch (e) {
        console.error('Test failed:', e);
    }
}

testParsing();
