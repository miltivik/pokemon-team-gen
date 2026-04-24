import { NextRequest, NextResponse } from "next/server";
import { FORMATS, type FormatId } from "@/config/formats";
import { sanitizeTemplateForFormat, type TemplateId } from "@/config/templates";
import { generateDynamicTeam } from "@/lib/dynamic-builder";
import { getMoveData, getPokemonData } from "@/lib/showdown-data";

interface LegacyGenerateTeamBody {
  format?: FormatId;
  tipo?: string | null;
  fijo?: string | null;
  fijos?: string[] | null;
  excludeLegendaries?: boolean;
  templateId?: TemplateId;
}

function getFixedMembers(body: LegacyGenerateTeamBody) {
  if (Array.isArray(body.fijos) && body.fijos.length > 0) {
    return body.fijos.filter(Boolean);
  }

  if (typeof body.fijo === "string" && body.fijo.trim()) {
    return [body.fijo.trim()];
  }

  return null;
}

function hydrateLegacyMember(member: Awaited<ReturnType<typeof generateDynamicTeam>>["team"][number]) {
  const pokemonData = getPokemonData(member.name);
  const moves = Array.isArray(member.moves)
    ? member.moves.map((move) => {
        if (typeof move !== "string") {
          return move;
        }

        return getMoveData(move) ?? move;
      })
    : [];

  return {
    ...pokemonData,
    ...member,
    moves,
    num: member.num ?? pokemonData?.num ?? 0,
    types: member.types ?? pokemonData?.types ?? [],
    baseStats:
      member.baseStats ??
      pokemonData?.baseStats ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    abilities: member.abilities ?? pokemonData?.abilities ?? {},
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LegacyGenerateTeamBody;
    const format = body.format && FORMATS[body.format] ? body.format : "gen9ou";
    const safeTemplateId = sanitizeTemplateForFormat(
      body.templateId,
      format
    );
    const result = await generateDynamicTeam({
      format,
      type: body.tipo ?? null,
      fixedMembers: getFixedMembers(body),
      excludeLegendaries: body.excludeLegendaries ?? false,
      templateId: safeTemplateId,
      lang: "en",
    });

    return NextResponse.json(result.team.map(hydrateLegacyMember));
  } catch (error) {
    console.error("Error generating team:", error);
    return NextResponse.json({ error: "Failed to generate team" }, { status: 500 });
  }
}
