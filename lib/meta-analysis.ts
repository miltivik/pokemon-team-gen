import {
  classifyTier,
  toClientSmogonStats,
  type SmogonMonData,
} from "@/lib/client-smogon-stats";
import { SmogonDataSource } from "@/lib/data-sources/smogon";
import { getCombinedStats, type CombinedPokemonData } from "@/lib/pikalytics";
import { getProperAbilityName, getProperItemName } from "@/lib/showdown-data";

export interface MetaOverviewData {
  topThreats: SmogonMonData[];
  tierGroups: Record<string, SmogonMonData[]>;
  topItems: { name: string; usage: number }[];
  topAbilities: { name: string; usage: number }[];
  loading: false;
}

export interface MetaOverviewPayload {
  meta: MetaOverviewData;
  combined: CombinedPokemonData[];
}

export function buildMetaOverview(stats: Record<string, SmogonMonData>): MetaOverviewData {
  const mons = Object.values(stats).sort((a, b) => b.usage - a.usage);
  const topThreats = mons.slice(0, 5);
  const tierGroups: Record<string, SmogonMonData[]> = {};
  const itemUsageMap: Record<string, number> = {};
  const abilityUsageMap: Record<string, number> = {};
  const top50 = mons.slice(0, 50);
  const totalUsage = top50.reduce((sum, mon) => sum + mon.usage, 0);
  const safeTotalUsage = totalUsage || 1;

  for (const mon of mons) {
    const tier = classifyTier(mon.usage);
    if (!tierGroups[tier]) tierGroups[tier] = [];
    tierGroups[tier].push(mon);
  }

  for (const mon of top50) {
    const totalItemCount = Object.values(mon.items || {}).reduce((sum, count) => sum + count, 0);
    if (totalItemCount > 0) {
      for (const [item, count] of Object.entries(mon.items || {})) {
        itemUsageMap[item] = (itemUsageMap[item] || 0) + (count / totalItemCount) * mon.usage;
      }
    }

    const totalAbilityCount = Object.values(mon.abilities || {}).reduce(
      (sum, count) => sum + count,
      0
    );
    if (totalAbilityCount > 0) {
      for (const [ability, count] of Object.entries(mon.abilities || {})) {
        abilityUsageMap[ability] =
          (abilityUsageMap[ability] || 0) + (count / totalAbilityCount) * mon.usage;
      }
    }
  }

  const topItems = Object.entries(itemUsageMap)
    .sort(([, leftUsage], [, rightUsage]) => rightUsage - leftUsage)
    .slice(0, 5)
    .map(([name, usage]) => ({ name: getProperItemName(name), usage: usage / safeTotalUsage }));

  const topAbilities = Object.entries(abilityUsageMap)
    .sort(([, leftUsage], [, rightUsage]) => rightUsage - leftUsage)
    .slice(0, 5)
    .map(([name, usage]) => ({ name: getProperAbilityName(name), usage: usage / safeTotalUsage }));

  return { topThreats, tierGroups, topItems, topAbilities, loading: false };
}

export async function getMetaOverview(format: string): Promise<MetaOverviewPayload | null> {
  const normalizedStats = await SmogonDataSource.getStats(format);
  if (!normalizedStats) return null;

  const smogonStats = toClientSmogonStats(normalizedStats);
  const [meta, combined] = await Promise.all([
    Promise.resolve(buildMetaOverview(smogonStats)),
    getCombinedStats(format, smogonStats),
  ]);

  return { meta, combined };
}

export async function getTierOverview(format: string): Promise<MetaOverviewData | null> {
  const normalizedStats = await SmogonDataSource.getStats(format);
  if (!normalizedStats) return null;

  return buildMetaOverview(toClientSmogonStats(normalizedStats));
}
