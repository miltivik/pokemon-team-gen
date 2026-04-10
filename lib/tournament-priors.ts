import { toID } from "@/lib/utils";

type TournamentPriorMode =
  | "balanced"
  | "offense"
  | "bulkyoffense"
  | "voltturn"
  | "rain"
  | "sun"
  | "sand"
  | "hazardstack"
  | "tailwind"
  | "trickroom"
  | "tempo";
type PriorModeMatch = "match" | "neutral" | "conflict" | "none";
type TournamentSelectionTier = "anchor" | "core" | "flex";

type TeamMemberLike = string | { name: string };
type RecommendedModeLike = { title?: string; members?: string[] };

interface TournamentPriorBase {
  id: string;
  format: string;
  mode: TournamentPriorMode;
  members: string[];
  weight: number;
  source: string;
  sourceDate: string;
  confidence: number;
}

export interface TournamentSpeciesPrior extends TournamentPriorBase {
  kind: "species";
  species: string;
}

export interface TournamentPackagePrior extends TournamentPriorBase {
  kind: "package";
}

export interface TournamentLeadPairPrior extends TournamentPriorBase {
  kind: "leadPair";
}

export interface TournamentBring4Prior extends TournamentPriorBase {
  kind: "bring4";
}

export interface TournamentPriorSet {
  id: string;
  format: string;
  sources: Array<{
    source: string;
    sourceDate: string;
  }>;
  speciesPriors: TournamentSpeciesPrior[];
  packages: TournamentPackagePrior[];
  leadPairs: TournamentLeadPairPrior[];
  bring4Priors: TournamentBring4Prior[];
}

interface TournamentPriorMatch<T extends TournamentPriorBase> {
  entry: T;
  presentMembers: string[];
  missingMembers: string[];
  overlapCount: number;
  completionRatio: number;
  modeMatch: PriorModeMatch;
  score: number;
}

export interface TournamentPriorCandidateSignals {
  speciesPriorScore: number;
  packageFitScore: number;
  leadPriorScore: number;
}

export interface TournamentPriorSelectionPlan {
  setId?: string;
  candidates: Array<{
    candidateId: string;
    tier: TournamentSelectionTier;
    pickRate: number;
    scoreBoost: number;
    supportScore: number;
  }>;
  activePackages: string[];
  activeLeadPairs: string[];
}

export interface TournamentPriorModeCoverage {
  setId: string;
  activeLeadPairs: string[];
  activeBring4Priors: string[];
  coveredLeadPairs: string[];
  coveredBring4Priors: string[];
  issues: string[];
  modeMatch: PriorModeMatch;
}

export interface TournamentPriorDiagnostics {
  setId: string;
  sources: Array<{
    source: string;
    sourceDate: string;
  }>;
  activePackages: string[];
  activeLeadPairs: string[];
  modeMatch: PriorModeMatch;
}

function createSpeciesPrior(
  format: string,
  mode: TournamentPriorMode,
  species: string,
  weight: number,
  source: string,
  sourceDate: string,
  confidence: number
): TournamentSpeciesPrior {
  return {
    kind: "species",
    id: `${format}:${toID(species)}:${mode}`,
    format,
    mode,
    species,
    members: [species],
    weight,
    source,
    sourceDate,
    confidence,
  };
}

function createPackagePrior(
  kind: "package" | "leadPair" | "bring4",
  options: Omit<TournamentPriorBase, "id"> & { id: string }
) {
  return {
    kind,
    ...options,
  } as TournamentPackagePrior | TournamentLeadPairPrior | TournamentBring4Prior;
}

const VGC_REG_F_PRIOR_SET: TournamentPriorSet = {
  id: "vgc-regf-2026-major-priors-v1",
  format: "gen9vgc2026f",
  sources: [
    {
      source: "Seattle Regional",
      sourceDate: "2026-03-01",
    },
    {
      source: "Grand Challenge IV",
      sourceDate: "2026-01-11",
    },
    {
      source: "Grand Challenge V",
      sourceDate: "2026-02-22",
    },
  ],
  speciesPriors: [
    createSpeciesPrior("gen9vgc2026f", "balanced", "Urshifu-Rapid-Strike", 1.0, "Seattle Regional", "2026-03-01", 1),
    createSpeciesPrior("gen9vgc2026f", "balanced", "Incineroar", 1.0, "Seattle Regional", "2026-03-01", 1),
    createSpeciesPrior("gen9vgc2026f", "balanced", "Amoonguss", 0.95, "Seattle Regional", "2026-03-01", 0.95),
    createSpeciesPrior("gen9vgc2026f", "tempo", "Flutter Mane", 0.95, "Seattle Regional", "2026-03-01", 0.95),
    createSpeciesPrior("gen9vgc2026f", "tempo", "Ogerpon-Wellspring", 0.9, "Seattle Regional", "2026-03-01", 0.9),
    createSpeciesPrior("gen9vgc2026f", "tailwind", "Ogerpon-Cornerstone", 1.0, "Seattle Regional", "2026-03-01", 1),
    createSpeciesPrior("gen9vgc2026f", "tailwind", "Tornadus", 0.9, "Seattle Regional", "2026-03-01", 0.9),
    createSpeciesPrior("gen9vgc2026f", "tailwind", "Whimsicott", 1.0, "Seattle Regional", "2026-03-01", 1),
    createSpeciesPrior("gen9vgc2026f", "tailwind", "Regidrago", 1.0, "Seattle Regional", "2026-03-01", 1),
    createSpeciesPrior("gen9vgc2026f", "trickroom", "Cresselia", 0.9, "Grand Challenge V", "2026-02-22", 0.9),
    createSpeciesPrior("gen9vgc2026f", "trickroom", "Ursaluna", 0.9, "Grand Challenge V", "2026-02-22", 0.9),
    createSpeciesPrior("gen9vgc2026f", "tailwind", "Gholdengo", 0.9, "Seattle Regional", "2026-03-01", 0.9),
  ],
  packages: [
    createPackagePrior("package", {
      id: "vgc-regf-balance-standard",
      format: "gen9vgc2026f",
      mode: "balanced",
      members: ["Incineroar", "Amoonguss", "Urshifu-Rapid-Strike", "Flutter Mane"],
      weight: 0.9,
      source: "Seattle Regional",
      sourceDate: "2026-03-01",
      confidence: 0.95,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "vgc-regf-tailwind-whimsi-regidrago",
      format: "gen9vgc2026f",
      mode: "tailwind",
      members: ["Whimsicott", "Regidrago", "Gholdengo", "Ogerpon-Cornerstone"],
      weight: 1.0,
      source: "Seattle Regional",
      sourceDate: "2026-03-01",
      confidence: 1,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "vgc-regf-trickroom-cress-ursaluna",
      format: "gen9vgc2026f",
      mode: "trickroom",
      members: ["Cresselia", "Ursaluna", "Incineroar", "Amoonguss"],
      weight: 0.9,
      source: "Grand Challenge V",
      sourceDate: "2026-02-22",
      confidence: 0.9,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "vgc-regf-tempo-torn-urshi",
      format: "gen9vgc2026f",
      mode: "tempo",
      members: ["Tornadus", "Urshifu-Rapid-Strike", "Flutter Mane", "Ogerpon-Wellspring"],
      weight: 0.75,
      source: "Grand Challenge IV",
      sourceDate: "2026-01-11",
      confidence: 0.8,
    }) as TournamentPackagePrior,
  ],
  leadPairs: [
    createPackagePrior("leadPair", {
      id: "vgc-regf-lead-whimsi-regidrago",
      format: "gen9vgc2026f",
      mode: "tailwind",
      members: ["Whimsicott", "Regidrago"],
      weight: 1.0,
      source: "Seattle Regional",
      sourceDate: "2026-03-01",
      confidence: 1,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "vgc-regf-lead-torn-urshi",
      format: "gen9vgc2026f",
      mode: "tempo",
      members: ["Tornadus", "Urshifu-Rapid-Strike"],
      weight: 0.9,
      source: "Seattle Regional",
      sourceDate: "2026-03-01",
      confidence: 0.9,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "vgc-regf-lead-cress-ursaluna",
      format: "gen9vgc2026f",
      mode: "trickroom",
      members: ["Cresselia", "Ursaluna"],
      weight: 0.9,
      source: "Grand Challenge V",
      sourceDate: "2026-02-22",
      confidence: 0.9,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "vgc-regf-lead-incin-amoonguss",
      format: "gen9vgc2026f",
      mode: "balanced",
      members: ["Incineroar", "Amoonguss"],
      weight: 0.75,
      source: "Grand Challenge IV",
      sourceDate: "2026-01-11",
      confidence: 0.8,
    }) as TournamentLeadPairPrior,
  ],
  bring4Priors: [
    createPackagePrior("bring4", {
      id: "vgc-regf-bring4-standard",
      format: "gen9vgc2026f",
      mode: "balanced",
      members: ["Incineroar", "Amoonguss", "Urshifu-Rapid-Strike", "Flutter Mane"],
      weight: 0.9,
      source: "Seattle Regional",
      sourceDate: "2026-03-01",
      confidence: 0.95,
    }) as TournamentBring4Prior,
    createPackagePrior("bring4", {
      id: "vgc-regf-bring4-tailwind",
      format: "gen9vgc2026f",
      mode: "tailwind",
      members: ["Whimsicott", "Regidrago", "Gholdengo", "Ogerpon-Cornerstone"],
      weight: 1.0,
      source: "Seattle Regional",
      sourceDate: "2026-03-01",
      confidence: 1,
    }) as TournamentBring4Prior,
    createPackagePrior("bring4", {
      id: "vgc-regf-bring4-trickroom",
      format: "gen9vgc2026f",
      mode: "trickroom",
      members: ["Cresselia", "Ursaluna", "Incineroar", "Amoonguss"],
      weight: 0.9,
      source: "Grand Challenge V",
      sourceDate: "2026-02-22",
      confidence: 0.9,
    }) as TournamentBring4Prior,
    createPackagePrior("bring4", {
      id: "vgc-regf-bring4-tempo",
      format: "gen9vgc2026f",
      mode: "tempo",
      members: ["Tornadus", "Urshifu-Rapid-Strike", "Flutter Mane", "Ogerpon-Wellspring"],
      weight: 0.75,
      source: "Grand Challenge IV",
      sourceDate: "2026-01-11",
      confidence: 0.8,
    }) as TournamentBring4Prior,
  ],
};

const GEN9_OU_PRIOR_SET: TournamentPriorSet = {
  id: "gen9ou-internal-curated-priors-v1",
  format: "gen9ou",
  sources: [
    {
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
    },
  ],
  speciesPriors: [
    createSpeciesPrior("gen9ou", "balanced", "Great Tusk", 1.0, "Internal curated OU priors", "2026-04-09", 1),
    createSpeciesPrior("gen9ou", "balanced", "Gholdengo", 0.98, "Internal curated OU priors", "2026-04-09", 0.98),
    createSpeciesPrior("gen9ou", "balanced", "Dragapult", 0.95, "Internal curated OU priors", "2026-04-09", 0.95),
    createSpeciesPrior("gen9ou", "bulkyoffense", "Ogerpon-Wellspring", 0.92, "Internal curated OU priors", "2026-04-09", 0.92),
    createSpeciesPrior("gen9ou", "bulkyoffense", "Zamazenta", 0.88, "Internal curated OU priors", "2026-04-09", 0.88),
    createSpeciesPrior("gen9ou", "offense", "Kingambit", 0.95, "Internal curated OU priors", "2026-04-09", 0.95),
    createSpeciesPrior("gen9ou", "offense", "Kyurem", 0.92, "Internal curated OU priors", "2026-04-09", 0.92),
    createSpeciesPrior("gen9ou", "offense", "Iron Valiant", 0.9, "Internal curated OU priors", "2026-04-09", 0.9),
    createSpeciesPrior("gen9ou", "hazardstack", "Glimmora", 1.0, "Internal curated OU priors", "2026-04-09", 1),
    createSpeciesPrior("gen9ou", "hazardstack", "Samurott-Hisui", 0.94, "Internal curated OU priors", "2026-04-09", 0.94),
    createSpeciesPrior("gen9ou", "voltturn", "Zapdos", 0.96, "Internal curated OU priors", "2026-04-09", 0.96),
    createSpeciesPrior("gen9ou", "voltturn", "Rotom-Wash", 0.94, "Internal curated OU priors", "2026-04-09", 0.94),
    createSpeciesPrior("gen9ou", "rain", "Pelipper", 1.0, "Internal curated OU priors", "2026-04-09", 1),
    createSpeciesPrior("gen9ou", "rain", "Barraskewda", 0.98, "Internal curated OU priors", "2026-04-09", 0.98),
    createSpeciesPrior("gen9ou", "rain", "Basculegion-F", 0.94, "Internal curated OU priors", "2026-04-09", 0.94),
    createSpeciesPrior("gen9ou", "sun", "Torkoal", 0.95, "Internal curated OU priors", "2026-04-09", 0.95),
    createSpeciesPrior("gen9ou", "sun", "Ninetales", 0.86, "Internal curated OU priors", "2026-04-09", 0.86),
    createSpeciesPrior("gen9ou", "sand", "Hippowdon", 1.0, "Internal curated OU priors", "2026-04-09", 1),
    createSpeciesPrior("gen9ou", "sand", "Excadrill", 0.98, "Internal curated OU priors", "2026-04-09", 0.98),
  ],
  packages: [
    createPackagePrior("package", {
      id: "ou-balance-standard",
      format: "gen9ou",
      mode: "balanced",
      members: ["Great Tusk", "Gholdengo", "Dragapult", "Clefable"],
      weight: 0.95,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.95,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "ou-bulkyoffense-standard",
      format: "gen9ou",
      mode: "bulkyoffense",
      members: ["Zamazenta", "Ogerpon-Wellspring", "Gliscor", "Gholdengo"],
      weight: 0.92,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.92,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "ou-offense-spikes",
      format: "gen9ou",
      mode: "offense",
      members: ["Samurott-Hisui", "Gholdengo", "Kingambit", "Dragapult"],
      weight: 0.94,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.94,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "ou-offense-screens",
      format: "gen9ou",
      mode: "offense",
      members: ["Grimmsnarl", "Kyurem", "Iron Valiant", "Iron Boulder"],
      weight: 0.84,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.82,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "ou-voltturn-standard",
      format: "gen9ou",
      mode: "voltturn",
      members: ["Zapdos", "Rotom-Wash", "Cinderace", "Ogerpon-Wellspring"],
      weight: 0.9,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.9,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "ou-rain-standard",
      format: "gen9ou",
      mode: "rain",
      members: ["Pelipper", "Barraskewda", "Basculegion-F", "Ogerpon-Wellspring"],
      weight: 0.96,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.96,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "ou-sand-standard",
      format: "gen9ou",
      mode: "sand",
      members: ["Hippowdon", "Excadrill", "Gliscor", "Garchomp"],
      weight: 0.94,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.94,
    }) as TournamentPackagePrior,
  ],
  leadPairs: [
    createPackagePrior("leadPair", {
      id: "ou-balance-pult-tusk",
      format: "gen9ou",
      mode: "balanced",
      members: ["Dragapult", "Great Tusk"],
      weight: 0.86,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.88,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "ou-offense-glimm-kingambit",
      format: "gen9ou",
      mode: "offense",
      members: ["Glimmora", "Kingambit"],
      weight: 0.92,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.9,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "ou-voltturn-zap-rotom",
      format: "gen9ou",
      mode: "voltturn",
      members: ["Zapdos", "Rotom-Wash"],
      weight: 0.9,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.9,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "ou-rain-pelipper-barra",
      format: "gen9ou",
      mode: "rain",
      members: ["Pelipper", "Barraskewda"],
      weight: 0.98,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.98,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "ou-sand-hippo-drill",
      format: "gen9ou",
      mode: "sand",
      members: ["Hippowdon", "Excadrill"],
      weight: 0.98,
      source: "Internal curated OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.98,
    }) as TournamentLeadPairPrior,
  ],
  bring4Priors: [],
};

const GEN8_OU_PRIOR_SET: TournamentPriorSet = {
  id: "gen8ou-internal-curated-priors-v1",
  format: "gen8ou",
  sources: [
    {
      source: "Internal curated Gen 8 OU priors",
      sourceDate: "2026-04-09",
    },
  ],
  speciesPriors: [
    createSpeciesPrior("gen8ou", "balanced", "Landorus-Therian", 1.0, "Internal curated Gen 8 OU priors", "2026-04-09", 1),
    createSpeciesPrior("gen8ou", "balanced", "Heatran", 0.96, "Internal curated Gen 8 OU priors", "2026-04-09", 0.96),
    createSpeciesPrior("gen8ou", "balanced", "Ferrothorn", 0.94, "Internal curated Gen 8 OU priors", "2026-04-09", 0.94),
    createSpeciesPrior("gen8ou", "balanced", "Clefable", 0.92, "Internal curated Gen 8 OU priors", "2026-04-09", 0.92),
    createSpeciesPrior("gen8ou", "offense", "Weavile", 0.96, "Internal curated Gen 8 OU priors", "2026-04-09", 0.96),
    createSpeciesPrior("gen8ou", "offense", "Dragapult", 0.94, "Internal curated Gen 8 OU priors", "2026-04-09", 0.94),
    createSpeciesPrior("gen8ou", "offense", "Kartana", 0.9, "Internal curated Gen 8 OU priors", "2026-04-09", 0.9),
    createSpeciesPrior("gen8ou", "voltturn", "Rotom-Wash", 0.95, "Internal curated Gen 8 OU priors", "2026-04-09", 0.95),
    createSpeciesPrior("gen8ou", "voltturn", "Zapdos", 0.93, "Internal curated Gen 8 OU priors", "2026-04-09", 0.93),
    createSpeciesPrior("gen8ou", "rain", "Pelipper", 1.0, "Internal curated Gen 8 OU priors", "2026-04-09", 1),
    createSpeciesPrior("gen8ou", "rain", "Barraskewda", 0.98, "Internal curated Gen 8 OU priors", "2026-04-09", 0.98),
    createSpeciesPrior("gen8ou", "sand", "Tyranitar", 1.0, "Internal curated Gen 8 OU priors", "2026-04-09", 1),
    createSpeciesPrior("gen8ou", "sand", "Excadrill", 0.98, "Internal curated Gen 8 OU priors", "2026-04-09", 0.98),
  ],
  packages: [
    createPackagePrior("package", {
      id: "gen8ou-balance-standard",
      format: "gen8ou",
      mode: "balanced",
      members: ["Landorus-Therian", "Heatran", "Ferrothorn", "Clefable"],
      weight: 0.96,
      source: "Internal curated Gen 8 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.96,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "gen8ou-offense-standard",
      format: "gen8ou",
      mode: "offense",
      members: ["Weavile", "Dragapult", "Kartana", "Heatran"],
      weight: 0.9,
      source: "Internal curated Gen 8 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.9,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "gen8ou-voltturn-standard",
      format: "gen8ou",
      mode: "voltturn",
      members: ["Rotom-Wash", "Landorus-Therian", "Zapdos", "Heatran"],
      weight: 0.9,
      source: "Internal curated Gen 8 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.9,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "gen8ou-rain-standard",
      format: "gen8ou",
      mode: "rain",
      members: ["Pelipper", "Barraskewda", "Ferrothorn", "Zapdos"],
      weight: 0.95,
      source: "Internal curated Gen 8 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.95,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "gen8ou-sand-standard",
      format: "gen8ou",
      mode: "sand",
      members: ["Tyranitar", "Excadrill", "Landorus-Therian", "Zapdos"],
      weight: 0.95,
      source: "Internal curated Gen 8 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.95,
    }) as TournamentPackagePrior,
  ],
  leadPairs: [
    createPackagePrior("leadPair", {
      id: "gen8ou-balance-lando-heatran",
      format: "gen8ou",
      mode: "balanced",
      members: ["Landorus-Therian", "Heatran"],
      weight: 0.88,
      source: "Internal curated Gen 8 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.88,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "gen8ou-voltturn-rotom-lando",
      format: "gen8ou",
      mode: "voltturn",
      members: ["Rotom-Wash", "Landorus-Therian"],
      weight: 0.92,
      source: "Internal curated Gen 8 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.9,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "gen8ou-rain-pelipper-barra",
      format: "gen8ou",
      mode: "rain",
      members: ["Pelipper", "Barraskewda"],
      weight: 0.98,
      source: "Internal curated Gen 8 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.98,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "gen8ou-sand-ttar-drill",
      format: "gen8ou",
      mode: "sand",
      members: ["Tyranitar", "Excadrill"],
      weight: 0.98,
      source: "Internal curated Gen 8 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.98,
    }) as TournamentLeadPairPrior,
  ],
  bring4Priors: [],
};

const GEN7_OU_PRIOR_SET: TournamentPriorSet = {
  id: "gen7ou-internal-curated-priors-v1",
  format: "gen7ou",
  sources: [
    {
      source: "Internal curated Gen 7 OU priors",
      sourceDate: "2026-04-09",
    },
  ],
  speciesPriors: [
    createSpeciesPrior("gen7ou", "balanced", "Landorus-Therian", 1.0, "Internal curated Gen 7 OU priors", "2026-04-09", 1),
    createSpeciesPrior("gen7ou", "balanced", "Heatran", 0.96, "Internal curated Gen 7 OU priors", "2026-04-09", 0.96),
    createSpeciesPrior("gen7ou", "balanced", "Ferrothorn", 0.94, "Internal curated Gen 7 OU priors", "2026-04-09", 0.94),
    createSpeciesPrior("gen7ou", "balanced", "Toxapex", 0.92, "Internal curated Gen 7 OU priors", "2026-04-09", 0.92),
    createSpeciesPrior("gen7ou", "offense", "Greninja", 0.95, "Internal curated Gen 7 OU priors", "2026-04-09", 0.95),
    createSpeciesPrior("gen7ou", "offense", "Kartana", 0.93, "Internal curated Gen 7 OU priors", "2026-04-09", 0.93),
    createSpeciesPrior("gen7ou", "offense", "Tapu Koko", 0.9, "Internal curated Gen 7 OU priors", "2026-04-09", 0.9),
    createSpeciesPrior("gen7ou", "voltturn", "Landorus-Therian", 0.96, "Internal curated Gen 7 OU priors", "2026-04-09", 0.96),
    createSpeciesPrior("gen7ou", "voltturn", "Tapu Koko", 0.94, "Internal curated Gen 7 OU priors", "2026-04-09", 0.94),
    createSpeciesPrior("gen7ou", "voltturn", "Tornadus-Therian", 0.92, "Internal curated Gen 7 OU priors", "2026-04-09", 0.92),
    createSpeciesPrior("gen7ou", "rain", "Pelipper", 1.0, "Internal curated Gen 7 OU priors", "2026-04-09", 1),
    createSpeciesPrior("gen7ou", "rain", "Kingdra", 0.98, "Internal curated Gen 7 OU priors", "2026-04-09", 0.98),
    createSpeciesPrior("gen7ou", "sand", "Tyranitar", 1.0, "Internal curated Gen 7 OU priors", "2026-04-09", 1),
    createSpeciesPrior("gen7ou", "sand", "Excadrill", 0.98, "Internal curated Gen 7 OU priors", "2026-04-09", 0.98),
  ],
  packages: [
    createPackagePrior("package", {
      id: "gen7ou-balance-standard",
      format: "gen7ou",
      mode: "balanced",
      members: ["Landorus-Therian", "Heatran", "Ferrothorn", "Toxapex"],
      weight: 0.96,
      source: "Internal curated Gen 7 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.96,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "gen7ou-offense-standard",
      format: "gen7ou",
      mode: "offense",
      members: ["Greninja", "Kartana", "Tapu Koko", "Landorus-Therian"],
      weight: 0.9,
      source: "Internal curated Gen 7 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.9,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "gen7ou-voltturn-standard",
      format: "gen7ou",
      mode: "voltturn",
      members: ["Tapu Koko", "Landorus-Therian", "Tornadus-Therian", "Heatran"],
      weight: 0.92,
      source: "Internal curated Gen 7 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.92,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "gen7ou-rain-standard",
      format: "gen7ou",
      mode: "rain",
      members: ["Pelipper", "Kingdra", "Ferrothorn", "Tapu Koko"],
      weight: 0.94,
      source: "Internal curated Gen 7 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.94,
    }) as TournamentPackagePrior,
    createPackagePrior("package", {
      id: "gen7ou-sand-standard",
      format: "gen7ou",
      mode: "sand",
      members: ["Tyranitar", "Excadrill", "Landorus-Therian", "Toxapex"],
      weight: 0.94,
      source: "Internal curated Gen 7 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.94,
    }) as TournamentPackagePrior,
  ],
  leadPairs: [
    createPackagePrior("leadPair", {
      id: "gen7ou-balance-lando-heatran",
      format: "gen7ou",
      mode: "balanced",
      members: ["Landorus-Therian", "Heatran"],
      weight: 0.88,
      source: "Internal curated Gen 7 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.88,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "gen7ou-voltturn-koko-lando",
      format: "gen7ou",
      mode: "voltturn",
      members: ["Tapu Koko", "Landorus-Therian"],
      weight: 0.92,
      source: "Internal curated Gen 7 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.9,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "gen7ou-rain-pelipper-kingdra",
      format: "gen7ou",
      mode: "rain",
      members: ["Pelipper", "Kingdra"],
      weight: 0.98,
      source: "Internal curated Gen 7 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.98,
    }) as TournamentLeadPairPrior,
    createPackagePrior("leadPair", {
      id: "gen7ou-sand-ttar-drill",
      format: "gen7ou",
      mode: "sand",
      members: ["Tyranitar", "Excadrill"],
      weight: 0.98,
      source: "Internal curated Gen 7 OU priors",
      sourceDate: "2026-04-09",
      confidence: 0.98,
    }) as TournamentLeadPairPrior,
  ],
  bring4Priors: [],
};

const TOURNAMENT_PRIOR_SETS: Record<string, TournamentPriorSet> = {
  gen7ou: GEN7_OU_PRIOR_SET,
  gen8ou: GEN8_OU_PRIOR_SET,
  gen9ou: GEN9_OU_PRIOR_SET,
  gen9vgc2026f: VGC_REG_F_PRIOR_SET,
};

function isCompatibleMode(templateId: string, priorMode: TournamentPriorMode) {
  switch (templateId) {
    case "balanced":
      return ["bulkyoffense", "voltturn"].includes(priorMode);
    case "offense":
      return ["hazardstack", "bulkyoffense"].includes(priorMode);
    case "bulkyoffense":
      return ["balanced", "offense", "voltturn"].includes(priorMode);
    case "voltturn":
      return ["balanced", "bulkyoffense"].includes(priorMode);
    case "hazardstack":
      return ["offense"].includes(priorMode);
    case "rain":
    case "sun":
    case "sand":
      return ["offense", "bulkyoffense"].includes(priorMode);
    default:
      return false;
  }
}

function getTeamNameIds(team: TeamMemberLike[]) {
  return team
    .map((member) => toID(typeof member === "string" ? member : member?.name))
    .filter(Boolean);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getModeMatch(templateId: string | undefined, priorMode: TournamentPriorMode): PriorModeMatch {
  if (!templateId || templateId === "random") {
    return priorMode === "balanced" ? "match" : "neutral";
  }
  if (templateId === priorMode) {
    return "match";
  }
  if (
    (templateId === "tailwind" && priorMode === "trickroom") ||
    (templateId === "trickroom" && priorMode === "tailwind")
  ) {
    return "conflict";
  }
  if (isCompatibleMode(templateId, priorMode)) {
    return "neutral";
  }
  return "neutral";
}

function getModeMultiplier(templateId: string | undefined, priorMode: TournamentPriorMode) {
  if (!templateId || templateId === "random") {
    return priorMode === "balanced" ? 1.1 : 1;
  }
  if (templateId === priorMode) {
    return 1.25;
  }
  if (
    (templateId === "tailwind" && priorMode === "trickroom") ||
    (templateId === "trickroom" && priorMode === "tailwind")
  ) {
    return 0.6;
  }
  if (isCompatibleMode(templateId, priorMode)) {
    return 1.08;
  }
  return 1;
}

function getNormalizedMembers(entry: TournamentPriorBase) {
  return entry.members.map((member) => toID(member));
}

function buildPriorMatch<T extends TournamentPriorBase>(
  entry: T,
  teamNameIds: string[],
  templateId?: string
): TournamentPriorMatch<T> {
  const teamSet = new Set(teamNameIds);
  const normalizedMembers = getNormalizedMembers(entry);
  const presentMembers = normalizedMembers.filter((memberId) => teamSet.has(memberId));
  const missingMembers = normalizedMembers.filter((memberId) => !teamSet.has(memberId));
  const completionRatio =
    normalizedMembers.length > 0 ? presentMembers.length / normalizedMembers.length : 0;
  const modeMatch = getModeMatch(templateId, entry.mode);
  const modeMultiplier = getModeMultiplier(templateId, entry.mode);
  const overlapBias = presentMembers.length > 0 ? 0.45 : 0.2;

  return {
    entry,
    presentMembers,
    missingMembers,
    overlapCount: presentMembers.length,
    completionRatio,
    modeMatch,
    score:
      (entry.weight * entry.confidence * modeMultiplier) *
      (completionRatio + overlapBias),
  };
}

function getSortedMatches<T extends TournamentPriorBase>(
  entries: T[],
  teamNameIds: string[],
  templateId?: string
) {
  return entries
    .map((entry) => buildPriorMatch(entry, teamNameIds, templateId))
    .sort((a, b) => b.score - a.score || b.overlapCount - a.overlapCount);
}

function hasModeCoverage(
  modes: RecommendedModeLike[],
  priorMembers: string[],
  minimumOverlap: number
) {
  const normalizedPriorMembers = priorMembers.map((member) => toID(member));
  return modes.some((mode) => {
    const modeMembers = new Set((mode.members ?? []).map((member) => toID(member)));
    const overlap = normalizedPriorMembers.filter((member) => modeMembers.has(member)).length;
    return overlap >= minimumOverlap;
  });
}

function resolveBestModeMatch(matches: Array<TournamentPriorMatch<TournamentPriorBase>>) {
  if (matches.length === 0) {
    return "none" as const;
  }

  const best = matches[0];
  return best.modeMatch;
}

export function getTournamentPriorSet(format: string): TournamentPriorSet | null {
  return TOURNAMENT_PRIOR_SETS[format] ?? null;
}

export function getTournamentPriorCandidateSignals(options: {
  format: string;
  templateId?: string;
  candidateName: string;
  currentTeam: TeamMemberLike[];
}): TournamentPriorCandidateSignals {
  const priorSet = getTournamentPriorSet(options.format);
  if (!priorSet) {
    return {
      speciesPriorScore: 0,
      packageFitScore: 0,
      leadPriorScore: 0,
    };
  }

  const candidateId = toID(options.candidateName);
  const teamNameIds = getTeamNameIds(options.currentTeam);
  const slotIndex = teamNameIds.length;
  const speciesPrior =
    priorSet.speciesPriors.find((entry) => toID(entry.species) === candidateId) ?? null;
  const speciesPriorScore = speciesPrior
    ? Math.min(1, speciesPrior.weight * speciesPrior.confidence)
    : 0;

  const packageFitScore = getSortedMatches(
    priorSet.packages.filter((entry) =>
      getNormalizedMembers(entry).includes(candidateId)
    ),
    teamNameIds,
    options.templateId
  )
    .map((match) => match.entry.weight * match.entry.confidence * match.completionRatio * getModeMultiplier(options.templateId, match.entry.mode))
    .reduce((best, score) => Math.max(best, score), 0);

  let leadPriorScore = 0;
  if (slotIndex < 4) {
    const slotMultiplier = slotIndex < 2 ? 1 : 0.55;
    leadPriorScore = getSortedMatches(
      priorSet.leadPairs.filter((entry) =>
        getNormalizedMembers(entry).includes(candidateId)
      ),
      teamNameIds,
      options.templateId
    )
      .map((match) => {
        const pairCompletion = match.overlapCount > 0 ? 1 : 0.65;
        return (
          match.entry.weight *
          match.entry.confidence *
          getModeMultiplier(options.templateId, match.entry.mode) *
          slotMultiplier *
          pairCompletion
        );
      })
      .reduce((best, score) => Math.max(best, score), 0);
  }

  return {
    speciesPriorScore,
    packageFitScore: Math.min(1.25, packageFitScore),
    leadPriorScore: Math.min(1.25, leadPriorScore),
  };
}

export function getTournamentPriorSelectionPlan(options: {
  format: string;
  templateId?: string;
  currentTeam: TeamMemberLike[];
}): TournamentPriorSelectionPlan {
  const priorSet = getTournamentPriorSet(options.format);
  if (!priorSet) {
    return {
      candidates: [],
      activePackages: [],
      activeLeadPairs: [],
    };
  }

  const teamNameIds = getTeamNameIds(options.currentTeam);
  const packageMatches = getSortedMatches(priorSet.packages, teamNameIds, options.templateId);
  const leadMatches = getSortedMatches(priorSet.leadPairs, teamNameIds, options.templateId);
  const candidateScores = new Map<string, number>();
  const teamSize = teamNameIds.length;
  const earlySlotMultiplier = teamSize < 2 ? 1 : teamSize < 4 ? 0.82 : 0.45;
  const addCandidateScore = (candidateId: string, score: number) => {
    if (!candidateId || score <= 0) {
      return;
    }
    candidateScores.set(candidateId, (candidateScores.get(candidateId) ?? 0) + score);
  };

  leadMatches.slice(0, 2).forEach((match, index) => {
    const sourceMultiplier = index === 0 ? 1 : 0.82;
    const activationMultiplier =
      teamSize === 0 ? 1 :
      match.overlapCount > 0 ? 1 :
      0.55;

    match.missingMembers.forEach((candidateId) => {
      addCandidateScore(
        candidateId,
        match.entry.weight *
          match.entry.confidence *
          getModeMultiplier(options.templateId, match.entry.mode) *
          earlySlotMultiplier *
          sourceMultiplier *
          activationMultiplier
      );
    });
  });

  packageMatches.slice(0, 3).forEach((match, index) => {
    const sourceMultiplier = index === 0 ? 1 : index === 1 ? 0.84 : 0.68;
    const completionMultiplier =
      match.overlapCount > 0 ? 0.95 + match.completionRatio * 0.35 : 0.52;
    const slotMultiplier = teamSize < 4 ? 1 : 0.58;

    match.missingMembers.forEach((candidateId) => {
      addCandidateScore(
        candidateId,
        match.entry.weight *
          match.entry.confidence *
          getModeMultiplier(options.templateId, match.entry.mode) *
          sourceMultiplier *
          completionMultiplier *
          slotMultiplier
      );
    });
  });

  priorSet.speciesPriors.forEach((entry) => {
    addCandidateScore(
      toID(entry.species),
      entry.weight *
        entry.confidence *
        getModeMultiplier(options.templateId, entry.mode) *
        (teamSize < 2 ? 0.48 : teamSize < 4 ? 0.38 : 0.2)
    );
  });

  const candidates = Array.from(candidateScores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([candidateId, supportScore]) => {
      let tier: TournamentSelectionTier = "flex";
      if (supportScore >= 1.3) {
        tier = "anchor";
      } else if (supportScore >= 0.72) {
        tier = "core";
      }

      const pickRateBase =
        tier === "anchor" ? (teamSize < 2 ? 0.82 : teamSize < 4 ? 0.68 : 0.42) :
        tier === "core" ? (teamSize < 2 ? 0.64 : teamSize < 4 ? 0.52 : 0.32) :
        (teamSize < 2 ? 0.38 : teamSize < 4 ? 0.28 : 0.16);
      const scoreBoostBase =
        tier === "anchor" ? (teamSize < 2 ? 1.34 : teamSize < 4 ? 1.22 : 1.1) :
        tier === "core" ? (teamSize < 2 ? 1.2 : teamSize < 4 ? 1.13 : 1.07) :
        (teamSize < 2 ? 1.1 : teamSize < 4 ? 1.06 : 1.03);

      return {
        candidateId,
        tier,
        pickRate: clamp(pickRateBase + Math.min(0.12, supportScore * 0.04), 0.12, 0.9),
        scoreBoost: clamp(scoreBoostBase + Math.min(0.12, supportScore * 0.03), 1.02, 1.45),
        supportScore,
      };
    });

  return {
    setId: priorSet.id,
    candidates,
    activePackages: packageMatches
      .filter((match) => match.overlapCount >= 2)
      .slice(0, 2)
      .map((match) => match.entry.id),
    activeLeadPairs: leadMatches
      .filter((match) => match.overlapCount >= 1)
      .slice(0, 2)
      .map((match) => match.entry.id),
  };
}

export function getTournamentPriorModeCoverage(options: {
  format: string;
  templateId?: string;
  team: TeamMemberLike[];
  recommendedModes?: RecommendedModeLike[];
}): TournamentPriorModeCoverage | null {
  const priorSet = getTournamentPriorSet(options.format);
  if (!priorSet) {
    return null;
  }

  const teamNameIds = getTeamNameIds(options.team);
  const modes = options.recommendedModes ?? [];
  const leadMatches = getSortedMatches(priorSet.leadPairs, teamNameIds, options.templateId).filter(
    (match) => match.overlapCount >= 2
  );
  const bring4Matches = getSortedMatches(priorSet.bring4Priors, teamNameIds, options.templateId).filter(
    (match) => match.overlapCount >= 3
  );
  const coveredLeadPairs = leadMatches
    .filter((match) => hasModeCoverage(modes, match.entry.members, 2))
    .map((match) => match.entry.id);
  const coveredBring4Priors = bring4Matches
    .filter((match) => hasModeCoverage(modes, match.entry.members, 3))
    .map((match) => match.entry.id);
  const issues: string[] = [];

  if (leadMatches.length > 0 && coveredLeadPairs.length === 0) {
    issues.push("recommended-modes:missing-active-lead-pair");
  }

  if (options.templateId === "tailwind") {
    const matchingLead = leadMatches.filter((match) => match.entry.mode === "tailwind");
    const matchingBring4 = bring4Matches.filter((match) => match.entry.mode === "tailwind");
    if (matchingLead.length > 0 && !matchingLead.some((match) => coveredLeadPairs.includes(match.entry.id))) {
      issues.push("recommended-modes:missing-tailwind-prior-mode");
    }
    if (matchingBring4.length > 0 && !matchingBring4.some((match) => coveredBring4Priors.includes(match.entry.id))) {
      issues.push("recommended-modes:missing-tailwind-bring4");
    }
  }

  if (options.templateId === "trickroom") {
    const matchingLead = leadMatches.filter((match) => match.entry.mode === "trickroom");
    const matchingBring4 = bring4Matches.filter((match) => match.entry.mode === "trickroom");
    if (matchingLead.length > 0 && !matchingLead.some((match) => coveredLeadPairs.includes(match.entry.id))) {
      issues.push("recommended-modes:missing-trickroom-prior-mode");
    }
    if (matchingBring4.length > 0 && !matchingBring4.some((match) => coveredBring4Priors.includes(match.entry.id))) {
      issues.push("recommended-modes:missing-trickroom-bring4");
    }
  }

  return {
    setId: priorSet.id,
    activeLeadPairs: leadMatches.map((match) => match.entry.id),
    activeBring4Priors: bring4Matches.map((match) => match.entry.id),
    coveredLeadPairs,
    coveredBring4Priors,
    issues,
    modeMatch: resolveBestModeMatch([
      ...bring4Matches,
      ...leadMatches,
    ]),
  };
}

export function getTournamentPriorDiagnostics(options: {
  format: string;
  templateId?: string;
  team: TeamMemberLike[];
  recommendedModes?: RecommendedModeLike[];
}): TournamentPriorDiagnostics | null {
  const priorSet = getTournamentPriorSet(options.format);
  if (!priorSet) {
    return null;
  }

  const teamNameIds = getTeamNameIds(options.team);
  const packageMatches = getSortedMatches(priorSet.packages, teamNameIds, options.templateId).filter(
    (match) => match.overlapCount >= 2
  );
  const leadMatches = getSortedMatches(priorSet.leadPairs, teamNameIds, options.templateId).filter(
    (match) => match.overlapCount >= 2
  );
  const modeCoverage = getTournamentPriorModeCoverage(options);

  return {
    setId: priorSet.id,
    sources: priorSet.sources,
    activePackages: packageMatches.slice(0, 3).map((match) => match.entry.id),
    activeLeadPairs: leadMatches.slice(0, 3).map((match) => match.entry.id),
    modeMatch: modeCoverage?.modeMatch ?? resolveBestModeMatch([
      ...packageMatches,
      ...leadMatches,
    ]),
  };
}
