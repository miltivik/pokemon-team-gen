import { generateDynamicTeam } from '../lib/dynamic-builder';

async function main() {
    try {
        const result = await generateDynamicTeam({
            format: 'gen6monotype',
            type: 'Dark',
            lang: 'es'
        });

        console.log(`Successfully generated team with ${result.team.length} members!`);
        console.log(result.team.map(m => m.name).join(', '));
    } catch (error) {
        console.error('Error:', error);
    }
}
main();
