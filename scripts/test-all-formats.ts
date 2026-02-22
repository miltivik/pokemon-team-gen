import { generateDynamicTeam } from '../lib/dynamic-builder';

const tests = [
    { format: 'gen1ou', type: null, lang: 'es' },
    { format: 'gen3ou', type: null, lang: 'es' },
    { format: 'gen4ou', type: null, lang: 'es' },
    { format: 'gen8monotype', type: 'Steel', lang: 'es' },
    { format: 'gen9ou', type: null, lang: 'es' },
    { format: 'gen9vgc2024regf', type: null, lang: 'es' },
    { format: 'gen7ubers', type: null, lang: 'en' },
    { format: 'gen2ou', type: null, lang: 'en' }
];

async function main() {
    let successCount = 0;
    for (const t of tests) {
        console.log(`\nTesting format: ${t.format}, type: ${t.type || 'None'}...`);
        try {
            const result = await generateDynamicTeam(t as any);
            console.log(`✅ Success! Team: ${result.team.map(m => m.name).join(', ')}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Error generating team for ${t.format}:`, error);
        }
    }
    console.log(`\n${successCount}/${tests.length} formats tested successfully.`);
}

main();
