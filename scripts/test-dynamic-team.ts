
import { generateDynamicTeam } from '../lib/dynamic-builder';
import fs from 'fs';

// This script tests the team generation logic directly (bypassing Next.js API route handler)
// It's useful for debugging generation logic and verifying fallbacks.

async function testGen() {
    // Change this format to test different scenarios
    const formatToTest = process.argv[2] || 'gen9ou';
    console.log(`Generating team for ${formatToTest}...`);

    try {
        const result = await generateDynamicTeam({ format: formatToTest });

        let output = '';
        output += `--- Team Generated (${formatToTest}) ---\n`;
        result.team.forEach(m => {
            output += `${m.name} @ ${m.item} (${m.role})\n`;
            output += `Moves: ${m.moves.join(', ')}\n`;
        });

        if (result.gameplan) {
            output += '\n--- Gameplan ---\n';
            output += `Early: ${result.gameplan.early.summary}\n`;
            output += `Mid: ${result.gameplan.mid.summary}\n`;
            output += `Late: ${result.gameplan.late.summary}\n`;
        }

        fs.writeFileSync('test-output.txt', output);
        console.log('Success! Output written to test-output.txt');
        console.log(output);

    } catch (e) {
        console.error('Error generating team:', e);
    }
}

testGen();
