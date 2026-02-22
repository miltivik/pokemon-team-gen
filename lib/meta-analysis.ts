
import { getSmogonStats, classifyTier, SmogonMonData } from "@/lib/smogon-stats";
import { getProperItemName, getProperAbilityName } from "@/lib/showdown-data";

export interface MetaOverviewData {
    topThreats: SmogonMonData[];
    tierGroups: Record<string, SmogonMonData[]>;
    topItems: { name: string; usage: number }[];
    topAbilities: { name: string; usage: number }[];
    loading: boolean;
}

export async function getMetaAnalysis(format: string): Promise<MetaOverviewData> {
    const stats = await getSmogonStats(format);
    const mons = Object.values(stats).sort((a, b) => b.usage - a.usage);

    // 1. Top Threats (Top 5 por uso)
    const topThreats = mons.slice(0, 5);

    // 2. Agrupación por Tiers Dinámica
    const tierGroups: Record<string, SmogonMonData[]> = {};
    mons.forEach(mon => {
        const tier = classifyTier(mon.usage);
        if (!tierGroups[tier]) tierGroups[tier] = [];
        tierGroups[tier].push(mon);
    });

    // 3. Cálculo de Items Globales (Aproximación ponderada)
    const itemUsageMap: Record<string, number> = {};
    const abilityUsageMap: Record<string, number> = {};

    // Analizar top 50 para rendimiento y relevancia (el meta lo definen los top mons)
    const top50 = mons.slice(0, 50);
    const totalUsage = top50.reduce((acc, mon) => acc + mon.usage, 0);

    top50.forEach(mon => {
        // Items
        if (mon.items) {
            Object.entries(mon.items).forEach(([item, rate]) => {
                // rate es ratio dentro del pokemon (0-1), mon.usage es ratio global (0-1)
                // Contribución al meta = uso del pokemon * uso del item en ese pokemon
                const globalImpact = rate * mon.usage;
                itemUsageMap[item] = (itemUsageMap[item] || 0) + globalImpact;
            });
        }

        // Abilities
        if (mon.abilities) {
            Object.entries(mon.abilities).forEach(([ability, rate]) => {
                const globalImpact = rate * mon.usage;
                abilityUsageMap[ability] = (abilityUsageMap[ability] || 0) + globalImpact;
            });
        }
    });

    const topItems = Object.entries(itemUsageMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, usage]) => ({ name: getProperItemName(name), usage: usage / totalUsage })); // Normalizar relativo al top 50

    const topAbilities = Object.entries(abilityUsageMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, usage]) => ({ name: getProperAbilityName(name), usage: usage / totalUsage }));

    return { topThreats, tierGroups, topItems, topAbilities, loading: false };
}
