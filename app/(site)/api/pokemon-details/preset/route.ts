import { NextRequest, NextResponse } from "next/server";
import { getCompetitiveSetByRole } from "@/lib/competitive-sets";
import { detectSetRole } from "@/lib/builder/roles";

function formatEvs(evs: Record<string, number>): string {
  const statMap: Record<string, string> = { hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };
  return Object.entries(evs)
    .filter((entry) => entry[1] > 0)
    .map(([stat, value]) => `${value} ${statMap[stat] || stat}`)
    .join(" / ") || "No investment";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const name = searchParams.get("name");
  const format = searchParams.get("format") || "ou";
  const presetId = searchParams.get("presetId");

  if (!name || !presetId) {
    return NextResponse.json(
      { error: "Pokemon name and presetId are required" },
      { status: 400 }
    );
  }

  try {
    const presetSet = getCompetitiveSetByRole(name, presetId, format);

    if (!presetSet) {
      return NextResponse.json(
        { error: "No competitive set found for this role" },
        { status: 404 }
      );
    }

    const normalizedEvs = {
      hp: presetSet.evs.hp ?? 0,
      atk: presetSet.evs.atk ?? 0,
      def: presetSet.evs.def ?? 0,
      spa: presetSet.evs.spa ?? 0,
      spd: presetSet.evs.spd ?? 0,
      spe: presetSet.evs.spe ?? 0,
    };

    const evsFormatted = formatEvs(normalizedEvs);
    const detectedRole = detectSetRole({
      moves: presetSet.moves,
      evs: normalizedEvs,
    });

    const response = {
      moves: presetSet.moves,
      item: presetSet.item,
      ability: presetSet.ability,
      nature: presetSet.nature,
      evs: evsFormatted,
      teraType: presetSet.teraType,
      role: detectedRole,
      setName: presetSet.setName,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in pokemon-details/preset API:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitive set" },
      { status: 500 }
    );
  }
}