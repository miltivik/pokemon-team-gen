import { NextRequest, NextResponse } from "next/server";
import {
  classifyTier,
  toClientSmogonStats,
  type SmogonMonData,
} from "@/lib/client-smogon-stats";
import { SmogonDataSource } from "@/lib/data-sources/smogon";
import { getProperAbilityName, getProperItemName } from "@/lib/showdown-data";
import { getCombinedStats } from "@/lib/pikalytics";

function buildMetaOverview(stats: Record<string, SmogonMonData>) {
  const mons = Object.values(stats).sort((a, b) => b.usage - a.usage);
  const topThreats = mons.slice(0, 5);
  const tierGroups: Record<string, SmogonMonData[]> = {};
  const itemUsageMap: Record<string, number> = {};
  const abilityUsageMap: Record<string, number> = {};
  const top50 = mons.slice(0, 50);
  const totalUsage = top50.reduce((acc, mon) => acc + mon.usage, 0);
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

    const totalAbilityCount = Object.values(mon.abilities || {}).reduce((sum, count) => sum + count, 0);
    if (totalAbilityCount > 0) {
      for (const [ability, count] of Object.entries(mon.abilities || {})) {
        abilityUsageMap[ability] = (abilityUsageMap[ability] || 0) + (count / totalAbilityCount) * mon.usage;
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

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format");

  if (!format) {
    return NextResponse.json({ error: "Format is required" }, { status: 400 });
  }

  try {
    const normalizedStats = await SmogonDataSource.getStats(format);
    if (!normalizedStats) {
      return NextResponse.json({ error: "Stats not found for this format" }, { status: 404 });
    }

    const smogonStats = toClientSmogonStats(normalizedStats);
    const [meta, combined] = await Promise.all([
      Promise.resolve(buildMetaOverview(smogonStats)),
      getCombinedStats(format, smogonStats),
    ]);

    return NextResponse.json({ meta, combined });
  } catch (error) {
    console.error("Error in meta-overview API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
