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
  /** Maximum number of Restricted Legendary Pokemon per team (VGC regulations). */
  maxRestrictedPokemon?: number;
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

const GEN9_VGC_REG_I_FALLBACK_POOL = [
  "Incineroar",
  "Rillaboom",
  "Amoonguss",
  "Flutter Mane",
  "Ogerpon-Wellspring",
  "Urshifu-Rapid-Strike",
  "Tornadus",
  "Whimsicott",
  "Gholdengo",
  "Archaludon",
  "Farigiraf",
  "Indeedee-F",
  "Pelipper",
  "Torkoal",
  "Kingambit",
  "Iron Hands",
  "Primarina",
  "Chi-Yu",
  "Raging Bolt",
  "Miraidon",
  "Koraidon",
  "Calyrex-Ice",
  "Calyrex-Shadow",
  "Zacian",
  "Kyogre",
  "Groudon",
  "Terapagos",
  "Dondozo",
  "Tatsugiri",
  "Landorus",
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

const GEN8_DOUBLES_FALLBACK_POOL = [
  "Incineroar",
  "Rillaboom",
  "Landorus-Therian",
  "Regieleki",
  "Urshifu-Rapid-Strike",
  "Zapdos",
  "Kartana",
  "Tapu Fini",
  "Amoonguss",
  "Heatran",
  "Volcarona",
  "Metagross",
  "Porygon2",
  "Celesteela",
  "Torkoal",
  "Venusaur",
  "Rotom-Wash",
  "Moltres-Galar",
  "Glastrier",
  "Dragapult",
];

const GEN7_DOUBLES_FALLBACK_POOL = [
  "Incineroar",
  "Landorus-Therian",
  "Tapu Fini",
  "Tapu Koko",
  "Tapu Lele",
  "Kartana",
  "Zapdos",
  "Amoonguss",
  "Heatran",
  "Volcanion",
  "Diancie",
  "Porygon2",
  "Kyurem-Black",
  "Kommo-o",
  "Celesteela",
  "Tyranitar",
  "Excadrill",
  "Snorlax",
  "Naganadel",
  "Metagross",
];

const GEN9_OU_FALLBACK_POOL = [
  "Great Tusk",
  "Gholdengo",
  "Kingambit",
  "Dragapult",
  "Dragonite",
  "Gliscor",
  "Zamazenta",
  "Ogerpon-Wellspring",
  "Samurott-Hisui",
  "Pecharunt",
  "Clefable",
  "Torkoal",
  "Pelipper",
  "Barraskewda",
  "Basculegion-F",
  "Hippowdon",
  "Excadrill",
  "Zapdos",
  "Rotom-Wash",
  "Cinderace",
  "Corviknight",
  "Moltres",
  "Glimmora",
  "Iron Valiant",
  "Kyurem",
  "Iron Boulder",
  "Darkrai",
  "Rillaboom",
  "Iron Crown",
  "Volcanion",
];

const GEN8_OU_FALLBACK_POOL = [
  "Landorus-Therian",
  "Heatran",
  "Dragapult",
  "Kartana",
  "Melmetal",
  "Tapu Fini",
  "Ferrothorn",
  "Tornadus-Therian",
  "Slowking-Galar",
  "Weavile",
  "Urshifu-Rapid-Strike",
  "Rillaboom",
  "Garchomp",
  "Dragonite",
  "Tyranitar",
  "Excadrill",
  "Corviknight",
  "Zapdos",
  "Rotom-Wash",
  "Blaziken",
];

const GEN7_OU_FALLBACK_POOL = [
  "Landorus-Therian",
  "Heatran",
  "Tapu Fini",
  "Tapu Koko",
  "Tapu Lele",
  "Magearna",
  "Greninja",
  "Ash-Greninja",
  "Ferrothorn",
  "Celesteela",
  "Toxapex",
  "Garchomp",
  "Tyranitar",
  "Excadrill",
  "Zapdos",
  "Scizor",
  "Hawlucha",
  "Volcarona",
  "Kartana",
  "Kommo-o",
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
    case "gen9ou":
      return {
        ...DEFAULT_PROFILE,
        id: "gen9ou",
        format,
        fallbackSpeciesPool: GEN9_OU_FALLBACK_POOL,
      };
    case "gen8ou":
      return {
        ...DEFAULT_PROFILE,
        id: "gen8ou",
        format,
        fallbackSpeciesPool: GEN8_OU_FALLBACK_POOL,
      };
    case "gen7ou":
      return {
        ...DEFAULT_PROFILE,
        id: "gen7ou",
        format,
        fallbackSpeciesPool: GEN7_OU_FALLBACK_POOL,
      };
    case "gen9doublesou":
      return buildDoublesProfile(format, {
        id: "gen9doublesou",
        forbiddenAbilityIds: ["commander", "shadowtag"],
        fallbackSpeciesPool: GEN9_DOUBLES_FALLBACK_POOL,
      });
    case "gen9vgc2026regi":
      return buildDoublesProfile(format, {
        id: "gen9vgc2026regi",
        isVgc: true,
        enforceItemClause: true,
        forbiddenTags: ["Mythical"],
        maxRestrictedPokemon: 2,
        fallbackSpeciesPool: GEN9_VGC_REG_I_FALLBACK_POOL,
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
        const fallbackSpeciesPool =
          format === "gen8doublesou"
            ? GEN8_DOUBLES_FALLBACK_POOL
            : format === "gen7doublesou"
              ? GEN7_DOUBLES_FALLBACK_POOL
              : [];
        return buildDoublesProfile(format, {
          id: format,
          fallbackSpeciesPool,
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
