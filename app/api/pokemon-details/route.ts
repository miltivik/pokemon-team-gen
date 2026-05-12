import { NextRequest, NextResponse } from "next/server";
import {
  getMoveData,
  getPokemonGeneration,
  getAbilityDescription,
  getTranslatedAbilityName,
  getTranslatedAbilityDesc,
  getTranslatedItemName,
  getTranslatedItemDesc,
  getTranslatedMoveName,
  getTranslatedMoveDesc,
  getPokemonSpriteUrl,
} from "@/lib/showdown-data";
import { getAvailableRoles } from "@/lib/competitive-sets";
import { getSmogonUrl } from "@/lib/pokemon-tier";
import { getStrategicRoleLabel } from "@/lib/strategic-role-label";
import { detectSetRole } from "@/lib/builder/roles";
import type { GeneratedTeamMember } from "@/lib/team-guide";
import type { Role } from "@/lib/showdown-data";

interface PokemonDetailsParams {
  name: string;
  format?: string;
  lang?: "en" | "es";
  item?: string;
  ability?: string;
}

interface MoveDetail {
  name: string;
  label: string;
  type: string;
  category: string;
  basePower: number | null;
  accuracy: number | true | null;
  pp: number;
  desc: string;
}

interface ItemDetail {
  name: string;
  label: string;
  desc: string;
}

interface AbilityDetail {
  slot: string;
  name: string;
  label: string;
  desc: string;
  selected: boolean;
}

function normalizeAbilityKey(value?: string): string {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function parseEvs(evsString?: string): Record<string, number> {
  const evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const statMap: Record<string, keyof typeof evs> = { hp: "hp", atk: "atk", def: "def", spa: "spa", spd: "spd", spe: "spe" };

  for (const part of (evsString ?? "").split("/").map((segment) => segment.trim())) {
    const match = part.match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i);
    if (!match) continue;
    const stat = statMap[match[2].toLowerCase()];
    if (!stat) continue;
    evs[stat] = Number(match[1]);
  }

  return evs;
}

function getMoveDetail(moveName: string, lang: "en" | "es"): MoveDetail | null {
  const move = getMoveData(moveName);
  if (!move) return null;

  return {
    name: move.name,
    label: getTranslatedMoveName(move.name, lang),
    type: move.type,
    category: move.category,
    basePower: move.basePower ?? null,
    accuracy: move.accuracy ?? null,
    pp: move.pp ?? 0,
    desc: getTranslatedMoveDesc(move.name, lang) || move.shortDesc || move.desc || "",
  };
}

function getItemDetail(itemName: string, lang: "en" | "es"): ItemDetail {
  return {
    name: itemName,
    label: getTranslatedItemName(itemName, lang),
    desc: getTranslatedItemDesc(itemName, lang) || "",
  };
}

function getAbilityDetails(
  abilities: Record<string, string>,
  selectedAbility: string,
  lang: "en" | "es"
): AbilityDetail[] {
  const selectedKey = normalizeAbilityKey(selectedAbility);

  return Object.entries(abilities).map(([slot, ability]) => {
    const isSelected = normalizeAbilityKey(ability) === selectedKey;
    const desc = getTranslatedAbilityDesc(ability, lang) || getAbilityDescription(ability).shortDesc || getAbilityDescription(ability).desc || "";

    return {
      slot,
      name: ability,
      label: getTranslatedAbilityName(ability, lang),
      desc,
      selected: isSelected,
    };
  });
}

function getAvailableRolePresets(name: string, format: string): string[] {
  return getAvailableRoles(name, format);
}

function getSmogonDetailsUrl(name: string, format?: string): string {
  return getSmogonUrl(name, format) || "";
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const name = searchParams.get("name");
  const format = searchParams.get("format") || "";
  const lang = (searchParams.get("lang") as "en" | "es") || "es";
  const item = searchParams.get("item") || undefined;
  const ability = searchParams.get("ability") || undefined;

  if (!name) {
    return NextResponse.json({ error: "Pokemon name is required" }, { status: 400 });
  }

  try {
    const generation = getPokemonGeneration(name);
    const spriteUrl = getPokemonSpriteUrl({ name } as GeneratedTeamMember);
    const itemDetail = item ? getItemDetail(item, lang) : null;
    const abilityDetails = ability ? getAbilityDetails(
      { "0": ability },
      ability,
      lang
    ) : [];
    const availableRolePresets = getAvailableRolePresets(name, format);
    const smogonUrl = getSmogonDetailsUrl(name, format);

    const response = {
      generation,
      spriteUrl,
      item: itemDetail,
      abilities: abilityDetails,
      availableRolePresets,
      smogonUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in pokemon-details API:", error);
    return NextResponse.json(
      { error: "Failed to fetch pokemon details" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  let text = "";
  try {
    text = await request.text();
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }
    body = JSON.parse(text);
  } catch (parseError) {
    console.error("POST /api/pokemon-details: Invalid JSON body", text, parseError);
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  try {
    const {
      name,
      format = "",
      lang = "es",
      moves = [],
      item,
      ability,
      evs,
      role,
      abilities: pokemonAbilities,
    } = body as unknown as PokemonDetailsParams & {
      moves?: string[];
      abilities?: Record<string, string>;
      evs?: string;
      nature?: string;
      role?: Role;
    };

    if (!name) {
      return NextResponse.json({ error: "Pokemon name is required" }, { status: 400 });
    }

    const generation = getPokemonGeneration(name);
    const spriteUrl = getPokemonSpriteUrl({ name } as GeneratedTeamMember);
    const itemDetail = item ? getItemDetail(item, lang) : null;

    const abilityDetails = pokemonAbilities
      ? getAbilityDetails(pokemonAbilities, ability || "", lang)
      : ability
        ? getAbilityDetails({ "0": ability }, ability, lang)
        : [];

    const moveDetails = (moves as string[])
      .map((moveName) => getMoveDetail(moveName, lang))
      .filter((m): m is MoveDetail => m !== null);

    const parsedEvs = parseEvs(evs);
    const normalizedEvs = {
        hp: parsedEvs.hp,
        atk: parsedEvs.atk,
        def: parsedEvs.def,
        spa: parsedEvs.spa,
        spd: parsedEvs.spd,
        spe: parsedEvs.spe,
    };
    const currentRole = role || detectSetRole({ moves, evs: normalizedEvs });
    const availableRolePresets = getAvailableRolePresets(name, format);

    const strategicRoleLabel = getStrategicRoleLabel(currentRole, (key: string) => key);
    // If the label resolved to a raw translation key, fall back to the readable role name
    const algorithmLabel =
      (strategicRoleLabel && !strategicRoleLabel.startsWith("role."))
        ? strategicRoleLabel
        : (currentRole || (lang === "es" ? "Recomendación del algoritmo" : "Algorithm recommendation"));

    const smogonUrl = getSmogonDetailsUrl(name, format);

    const response = {
      generation,
      spriteUrl,
      item: itemDetail,
      abilities: abilityDetails,
      moves: moveDetails,
      availableRolePresets,
      smogonUrl,
      currentRole,
      algorithmLabel,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in pokemon-details POST API:", error);
    return NextResponse.json(
      { error: "Failed to process pokemon details" },
      { status: 500 }
    );
  }
}
