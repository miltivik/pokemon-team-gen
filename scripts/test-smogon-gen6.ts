import { SmogonDataSource } from '../lib/data-sources/smogon';

async function main() {
    const data = await SmogonDataSource.getStats('gen6ou');
    if (data) {
        console.log(`Found data! Total battles: ${data.meta.totalBattles}, Pokemon: ${Object.keys(data.pokemon).length}`);
    } else {
        console.log('No data found for gen6ou');
    }
}
main();
