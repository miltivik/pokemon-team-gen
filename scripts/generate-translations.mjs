/**
 * Generates data/translations-es.json by fetching Spanish names from PokeAPI.
 * 
 * Usage: node scripts/generate-translations.mjs
 * 
 * This only needs to run once. The output file is committed to the repo.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Load existing Showdown data to get the English names
const movesData = JSON.parse(readFileSync(resolve(ROOT, 'data/moves.json'), 'utf-8'));
const abilitiesData = JSON.parse(readFileSync(resolve(ROOT, 'data/abilities.json'), 'utf-8'));

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const BATCH_SIZE = 20; // concurrent requests per batch
const DELAY_MS = 600;  // delay between batches to respect rate limit

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function getSpanishName(names) {
    const es = names?.find(n => n.language?.name === 'es');
    return es?.name || null;
}

function getSpanishFlavorText(flavorTexts) {
    if (!flavorTexts) return null;
    // Get the latest Spanish flavor text
    const esEntries = flavorTexts.filter(f => f.language?.name === 'es');
    return esEntries.length > 0 ? esEntries[esEntries.length - 1].flavor_text?.replace(/\n/g, ' ').trim() : null;
}

async function fetchJSON(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function processBatch(items, processor) {
    const results = [];
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(processor));
        results.push(...batchResults);

        const done = Math.min(i + BATCH_SIZE, items.length);
        process.stdout.write(`\r  ${done}/${items.length}`);

        if (i + BATCH_SIZE < items.length) {
            await sleep(DELAY_MS);
        }
    }
    console.log(' ✓');
    return results;
}

async function main() {
    console.log('🔄 Generating Spanish translations...\n');

    // --- MOVES ---
    const moveEntries = Object.entries(movesData)
        .filter(([, m]) => m.num > 0)
        .map(([id, m]) => ({ id, name: m.name, num: m.num }));

    console.log(`📦 Moves: ${moveEntries.length} entries`);

    const moveTranslations = {};
    const moveResults = await processBatch(moveEntries, async (entry) => {
        const data = await fetchJSON(`${POKEAPI_BASE}/move/${entry.num}`);
        if (!data) return null;
        const esName = getSpanishName(data.names);
        const esDesc = getSpanishFlavorText(data.flavor_text_entries);
        if (esName) {
            return { enName: entry.name, esName, esDesc };
        }
        return null;
    });

    for (const r of moveResults) {
        if (r) {
            moveTranslations[r.enName] = { name: r.esName };
            if (r.esDesc) moveTranslations[r.enName].desc = r.esDesc;
        }
    }

    // --- ABILITIES ---
    // Abilities data doesn't have `num` — look up by slug name
    const abilityEntries = Object.entries(abilitiesData)
        .filter(([id]) => id !== 'noability')
        .map(([id, a]) => {
            // Convert showdown ID to PokeAPI slug: "airlock" → "air-lock"
            const slug = a.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return { id, name: a.name, slug };
        });

    console.log(`📦 Abilities: ${abilityEntries.length} entries`);

    const abilityTranslations = {};
    const abilityResults = await processBatch(abilityEntries, async (entry) => {
        const data = await fetchJSON(`${POKEAPI_BASE}/ability/${entry.slug}`);
        if (!data) return null;
        const esName = getSpanishName(data.names);
        const esDesc = getSpanishFlavorText(data.flavor_text_entries);
        if (esName) {
            return { enName: entry.name, esName, esDesc };
        }
        return null;
    });

    for (const r of abilityResults) {
        if (r) {
            abilityTranslations[r.enName] = { name: r.esName };
            if (r.esDesc) abilityTranslations[r.enName].desc = r.esDesc;
        }
    }

    // --- ITEMS ---
    console.log('\n📦 Extracting Items from Sets...');
    const setsData = JSON.parse(readFileSync(resolve(ROOT, 'data/gen9-sets.json'), 'utf-8'));
    const allItems = new Set();

    // Iterate through all sets to find unique items
    for (const pokemon in setsData) {
        for (const format in setsData[pokemon]) {
            for (const set in setsData[pokemon][format]) {
                const item = setsData[pokemon][format][set].item;
                if (!item) continue;
                if (Array.isArray(item)) {
                    item.forEach(i => allItems.add(i));
                } else {
                    allItems.add(item);
                }
            }
        }
    }

    const itemEntries = Array.from(allItems).map(name => {
        // "Heavy-Duty Boots" -> "heavy-duty-boots"
        // "King's Rock" -> "kings-rock"
        const slug = name.toLowerCase()
            .replace(/['’]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        return { name, slug };
    });

    console.log(`📦 Items: ${itemEntries.length} entries`);

    const itemTranslations = {};
    const itemResults = await processBatch(itemEntries, async (entry) => {
        const data = await fetchJSON(`${POKEAPI_BASE}/item/${entry.slug}`);
        if (!data) return null;
        const esName = getSpanishName(data.names);
        // Items usually have flavor_text_entries too
        const esDesc = getSpanishFlavorText(data.flavor_text_entries);
        if (esName) {
            return { enName: entry.name, esName, esDesc };
        }
        return null;
    });

    for (const r of itemResults) {
        if (r) {
            itemTranslations[r.enName] = { name: r.esName };
            // Optional: output item desc if we want it later
            // if (r.esDesc) itemTranslations[r.enName].desc = r.esDesc;
        }
    }

    // --- OUTPUT ---
    const output = {
        _generated: new Date().toISOString(),
        _source: 'PokeAPI (https://pokeapi.co)',
        moves: moveTranslations,
        abilities: abilityTranslations,
        items: itemTranslations,
    };

    const outPath = resolve(ROOT, 'data/translations-es.json');
    writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

    const movesCount = Object.keys(moveTranslations).length;
    const abilitiesCount = Object.keys(abilityTranslations).length;
    const itemsCount = Object.keys(itemTranslations).length;
    const sizeKB = (Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(1);

    console.log(`\n✅ Generated ${outPath}`);
    console.log(`   Moves: ${movesCount}/${moveEntries.length} translated`);
    console.log(`   Abilities: ${abilitiesCount}/${abilityEntries.length} translated`);
    console.log(`   Items: ${itemsCount}/${itemEntries.length} translated`);
    console.log(`   File size: ${sizeKB} KB`);
}

main().catch(console.error);
