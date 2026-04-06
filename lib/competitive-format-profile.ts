import { FORMATS, type FormatId } from "@/config/formats";
import type { PokemonSpecies } from "@/lib/data-sources/dex";

export interface CompetitiveFormatProfile {
  id: string;
  format: string;
  isDoubles: boolean;
  isVgc: boolean;
  enforceItemClause: boolean;
  allowHazards: boolean;
  requireRecommendedModes: boolean;
  forbiddenAbilityIds: string[];
  forbiddenTags: string[];
  fallbackSpeciesPool: string[];
}

const GEN9_DOUBLES_FALLBACK_POOL = [
  "Incineroar",
  "Rillaboom",
  "Amoonguss",
  "Ogerpon-Wellspring",
  "Urshifu-Rapid-Strike",
  "Iron Hands",
  "Archaludon",
  "Gholdengo",
  "Volcarona",
  "Primarina",
  "Zapdos",
  "Tornadus",
  "Dragonite",
  "Salamence",
  "Farigiraf",
  "Indeedee-F",
  "Clefable",
  "Brute Bonnet",
  "Kingambit",
  "Garchomp",
  "Metagross",
  "Terrakion",
  "Great Tusk",
  "Enamorus",
  "Mamoswine",
  "Pelipper",
  "Iron Jugulis",
  "Sneasler",
  "Jumpluff",
  "Talonflame",
];

const GEN9_VGC_REG_F_FALLBACK_POOL = [
  "Incineroar",
  "Rillaboom",
  "Amoonguss",
  "Ogerpon-Wellspring",
  "Urshifu-Rapid-Strike",
  "Archaludon",
  "Gholdengo",
  "Farigiraf",
  "Indeedee-F",
  "Tornadus",
  "Pelipper",
  "Torkoal",
  "Kingambit",
  "Iron Hands",
  "Primarina",
  "Brute Bonnet",
  "Dragonite",
  "Salamence",
  "Volcarona",
  "Garchomp",
  "Talonflame",
  "Jumpluff",
  "Dondozo",
  "Tatsugiri",
  "Clefable",
  "Armarouge",
  "Porygon2",
  "Hatterene",
  "Gallade",
  "Annihilape",
];

const DEFAULT_PROFILE: CompetitiveFormatProfile = {
  id: "default",
  format: "default",
  isDoubles: false,
  isVgc: false,
  enforceItemClause: false,
  allowHazards: true,
  requireRecommendedModes: false,
  forbiddenAbilityIds: [],
  forbiddenTags: [],
  fallbackSpeciesPool: [],
};

function buildDoublesProfile(
  format: string,
  overrides: Partial<CompetitiveFormatProfile> = {}
): CompetitiveFormatProfile {
  return {
    ...DEFAULT_PROFILE,
    format,
    isDoubles: true,
    allowHazards: false,
    requireRecommendedModes: true,
    ...overrides,
  };
}

export function getCompetitiveFormatProfile(
  format: string
): CompetitiveFormatProfile {
  switch (format) {
    case "gen9doublesou":
      return buildDoublesProfile(format, {
        id: "gen9doublesou",
        forbiddenAbilityIds: ["commander", "shadowtag"],
        fallbackSpeciesPool: GEN9_DOUBLES_FALLBACK_POOL,
      });
    case "gen9vgc2026f":
      return buildDoublesProfile(format, {
        id: "gen9vgc2026f",
        isVgc: true,
        enforceItemClause: true,
        forbiddenTags: ["Mythical", "Restricted Legendary"],
        fallbackSpeciesPool: GEN9_VGC_REG_F_FALLBACK_POOL,
      });
    default: {
      const knownFormat = FORMATS[format as FormatId];
      if (knownFormat?.gameType === "doubles") {
        return buildDoublesProfile(format, {
          id: format,
        });
      }

      return {
        ...DEFAULT_PROFILE,
        id: format,
        format,
      };
    }
  }
}

export function getFallbackSpeciesPool(
  profile: CompetitiveFormatProfile
): string[] {
  return [...profile.fallbackSpeciesPool];
}

export function speciesViolatesFormatProfile(
  species: PokemonSpecies,
  profile: CompetitiveFormatProfile
): boolean {
  const speciesTags = Array.isArray(species.tags) ? species.tags : [];

  return profile.forbiddenTags.some((tag) => speciesTags.includes(tag));
}
