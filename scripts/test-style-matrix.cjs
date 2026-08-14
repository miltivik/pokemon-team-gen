/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const movesData = require("../data/moves.json");

const rootDir = path.resolve(__dirname, "..");
const jiti = require("jiti")(__filename, {
  interopDefault: true,
  alias: {
    "@": rootDir,
    "@/": `${rootDir}${path.sep}`,
  },
});

const { FORMATS } = jiti(path.join(rootDir, "config/formats.ts"));
const { TEMPLATES, sanitizeTemplateForFormat } = jiti(
  path.join(rootDir, "config/templates.ts")
);
const { generateDynamicTeam } = jiti(path.join(rootDir, "lib/dynamic-builder.ts"));
const { getCompetitiveFormatProfile } = jiti(
  path.join(rootDir, "lib/competitive-format-profile.ts")
);
const { isAllowedInFormat } = jiti(path.join(rootDir, "lib/format-rules.ts"));
const { getTournamentPriorModeCoverage } = jiti(
  path.join(rootDir, "lib/tournament-priors.ts")
);
const { validateTeamForTemplate } = jiti(
  path.join(rootDir, "lib/builder/team-validator.ts")
);

const MOVES = movesData;
const CHOICE_ITEMS = new Set(["Choice Band", "Choice Specs", "Choice Scarf"]);
const STATUS_WHITELIST = new Set([
  "Trick",
  "Switcheroo",
  "Sleep Talk",
  "Healing Wish",
  "Memento",
  "Parting Shot",
]);
const HAZARD_MOVE_IDS = new Set(
  ["Stealth Rock", "Spikes", "Toxic Spikes", "Sticky Web", "Ceaseless Edge"].map(toID)
);

const STYLE_MATRIX = [
  {
    id: "ou-balanced",
    format: "gen9ou",
    templateId: "balanced",
    allowedArchetypes: ["balanced", "bulkyoffense", "voltturn"],
    minValidationScore: 0.74,
    minPassRate: 0.85,
    maxMissingSupport: 1,
  },
  {
    id: "ou-offense",
    format: "gen9ou",
    templateId: "offense",
    allowedArchetypes: ["offense", "hazardstack"],
    minValidationScore: 0.76,
    minPassRate: 0.85,
    maxMissingSupport: 1,
  },
  {
    id: "ou-bulkyoffense",
    format: "gen9ou",
    templateId: "bulkyoffense",
    allowedArchetypes: ["bulkyoffense", "balanced", "offense", "voltturn"],
    minValidationScore: 0.65,
    minPassRate: 0.75,
    maxMissingSupport: 1,
  },
  {
    id: "ou-voltturn",
    format: "gen9ou",
    templateId: "voltturn",
    allowedArchetypes: ["voltturn", "balanced"],
    minValidationScore: 0.78,
    minPassRate: 0.85,
    requireCleanCore: true,
    maxMissingSupport: 0,
  },
  {
    id: "ou-hazardstack",
    format: "gen9ou",
    templateId: "hazardstack",
    allowedArchetypes: ["hazardstack", "offense"],
    minValidationScore: 0.8,
    minPassRate: 0.85,
    requireCleanCore: true,
    maxMissingSupport: 0,
  },
  {
    id: "ou-semistall",
    format: "gen9ou",
    templateId: "semistall",
    allowedArchetypes: ["semistall", "stall", "balanced"],
    minValidationScore: 0.76,
    minPassRate: 0.8,
    requireCleanCore: true,
    maxMissingSupport: 1,
  },
  {
    id: "ou-stall",
    format: "gen9ou",
    templateId: "stall",
    allowedArchetypes: ["stall", "semistall"],
    minValidationScore: 0.8,
    minPassRate: 0.85,
    requireCleanCore: true,
    maxMissingSupport: 1,
  },
  {
    id: "ou-rain",
    format: "gen9ou",
    templateId: "rain",
    allowedArchetypes: ["rain"],
    minValidationScore: 0.82,
    minPassRate: 0.9,
    requireCleanCore: true,
    maxMissingSupport: 1,
  },
  {
    id: "ou-sun",
    format: "gen9ou",
    templateId: "sun",
    allowedArchetypes: ["sun"],
    minValidationScore: 0.79,
    minPassRate: 0.75,
    requireCleanCore: true,
    maxMissingSupport: 1,
  },
  {
    id: "ou-sand",
    format: "gen9ou",
    templateId: "sand",
    allowedArchetypes: ["sand"],
    minValidationScore: 0.79,
    minPassRate: 0.75,
    requireCleanCore: true,
    maxMissingSupport: 1,
  },
  {
    id: "ou-weatheroffense",
    format: "gen9ou",
    templateId: "weatheroffense",
    allowedArchetypes: ["rain", "sun", "sand", "offense"],
    minValidationScore: 0.8,
    minPassRate: 0.75,
    requireCleanCore: true,
    maxMissingSupport: 1,
  },
  {
    id: "vgc-balanced",
    format: "gen9vgc2026f",
    templateId: "balanced",
    allowedArchetypes: ["balanced", "bulkyoffense", "tailwind", "trickroom"],
    minValidationScore: 0.69,
    minPassRate: 0.8,
    maxMissingSupport: 1,
    requireResolvedFormat: "gen9vgc2026regf",
    requireRecommendedModes: true,
  },
  {
    id: "vgc-trickroom",
    format: "gen9vgc2026f",
    templateId: "trickroom",
    allowedArchetypes: ["trickroom"],
    minValidationScore: 0.82,
    minPassRate: 0.9,
    requireCleanCore: true,
    maxMissingSupport: 1,
    requireRecommendedModes: true,
    requireResolvedFormat: "gen9vgc2026regf",
  },
  {
    id: "vgc-tailwind",
    format: "gen9vgc2026f",
    templateId: "tailwind",
    allowedArchetypes: ["tailwind"],
    minValidationScore: 0.82,
    minPassRate: 0.9,
    requireCleanCore: true,
    maxMissingSupport: 1,
    requireRecommendedModes: true,
    requireResolvedFormat: "gen9vgc2026regf",
  },
  {
    id: "vgc-tailwind-prior-backed",
    format: "gen9vgc2026f",
    templateId: "tailwind",
    allowedArchetypes: ["tailwind"],
    minValidationScore: 0.82,
    minPassRate: 0.85,
    requireCleanCore: true,
    maxMissingSupport: 1,
    requireRecommendedModes: true,
    requireTournamentPriorModeCoverage: true,
    requiredActivePackages: ["vgc-regf-tailwind-whimsi-regidrago"],
    requiredActiveLeadPairs: ["vgc-regf-lead-whimsi-regidrago"],
    fixture: "vgc-prior-tailwind-sparse",
  },
  {
    id: "vgc-trickroom-prior-backed",
    format: "gen9vgc2026f",
    templateId: "trickroom",
    allowedArchetypes: ["trickroom"],
    minValidationScore: 0.82,
    minPassRate: 0.85,
    requireCleanCore: true,
    maxMissingSupport: 1,
    requireRecommendedModes: true,
    requireTournamentPriorModeCoverage: true,
    requiredActivePackages: ["vgc-regf-trickroom-cress-ursaluna"],
    requiredActiveLeadPairs: ["vgc-regf-lead-cress-ursaluna"],
    fixture: "vgc-prior-trickroom-sparse",
  },
  {
    id: "vgc-regi-balanced",
    format: "gen9vgc2026regi",
    templateId: "balanced",
    allowedArchetypes: ["balanced", "bulkyoffense", "tailwind", "trickroom"],
    minValidationScore: 0.6,
    minPassRate: 0.75,
    maxMissingSupport: 2,
    requireRecommendedModes: true,
  },
  {
    id: "dou-balanced",
    format: "gen9doublesou",
    templateId: "balanced",
    allowedArchetypes: ["balanced", "bulkyoffense", "tailwind", "trickroom"],
    minValidationScore: 0.67,
    minPassRate: 0.75,
    maxMissingSupport: 1,
    requireRecommendedModes: true,
  },
  {
    id: "dou-trickroom",
    format: "gen9doublesou",
    templateId: "trickroom",
    allowedArchetypes: ["trickroom"],
    minValidationScore: 0.8,
    minPassRate: 0.85,
    requireCleanCore: true,
    maxMissingSupport: 1,
    requireRecommendedModes: true,
  },
  {
    id: "dou-tailwind",
    format: "gen9doublesou",
    templateId: "tailwind",
    allowedArchetypes: ["tailwind"],
    minValidationScore: 0.8,
    minPassRate: 0.85,
    requireCleanCore: true,
    maxMissingSupport: 1,
    requireRecommendedModes: true,
  },
];

function toID(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function parseArgs(argv) {
  const args = {
    iterations: 4,
    caseId: null,
  };

  for (const token of argv) {
    if (token.startsWith("--iterations=")) {
      const parsed = Number(token.split("=")[1]);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.iterations = parsed;
      }
    } else if (token.startsWith("--case=")) {
      args.caseId = token.split("=")[1] || null;
    }
  }

  return args;
}

function getMoveNames(member) {
  if (!Array.isArray(member.moves)) {
    return [];
  }

  return member.moves.map((move) => {
    if (typeof move === "string") {
      return move;
    }
    if (move && typeof move.name === "string") {
      return move.name;
    }
    return String(move || "");
  });
}

function collectSetCoherenceIssues(team, format) {
  const isDoubles = FORMATS[format]?.gameType === "doubles";
  const issues = [];
  let protectUsers = 0;

  for (const member of team) {
    const moveNames = getMoveNames(member);
    if (moveNames.some((moveName) => toID(moveName) === toID("Protect"))) {
      protectUsers += 1;
    }
    const moveEntries = moveNames
      .map((moveName) => {
        const move = MOVES[toID(moveName)];
        return move ? { ...move, name: move.name || moveName } : null;
      })
      .filter(Boolean);
    const statusMoves = moveEntries.filter((move) => move.category === "Status");
    const physicalMoves = moveEntries.filter((move) => move.category === "Physical");
    const specialMoves = moveEntries.filter((move) => move.category === "Special");
    const invalidChoiceStatus = statusMoves.filter(
      (move) => !STATUS_WHITELIST.has(move.name)
    );

    if (member.item === "Assault Vest" && statusMoves.length > 0) {
      issues.push(`${member.name}:assault-vest-status-conflict`);
    }
    if (CHOICE_ITEMS.has(member.item) && invalidChoiceStatus.length > 0) {
      issues.push(`${member.name}:choice-status-conflict`);
    }
    if (member.item === "Choice Band" && physicalMoves.length === 0) {
      issues.push(`${member.name}:choice-band-no-physical`);
    }
    if (member.item === "Choice Specs" && specialMoves.length === 0) {
      issues.push(`${member.name}:choice-specs-no-special`);
    }
    if (
      isDoubles &&
      moveNames.some((moveName) => HAZARD_MOVE_IDS.has(toID(moveName)))
    ) {
      issues.push(`${member.name}:hazard-set-in-doubles`);
    }
  }

  if (isDoubles && team.length >= 6 && protectUsers > 4) {
    issues.push(`team:protect-overload:${protectUsers}`);
  }

  return issues;
}

function collectFormatRuleIssues(team, format) {
  const issues = [];
  const formatProfile = getCompetitiveFormatProfile(format);
  const illegalMembers = team
    .filter((member) => !isAllowedInFormat(member, format))
    .map((member) => member.name);

  if (illegalMembers.length > 0) {
    issues.push(`illegal-members:${illegalMembers.join(",")}`);
  }

  if (formatProfile.enforceItemClause) {
    const seenItems = new Set();
    const duplicateItems = [];

    for (const member of team) {
      if (!member.item) {
        continue;
      }
      if (seenItems.has(member.item)) {
        duplicateItems.push(member.item);
        continue;
      }
      seenItems.add(member.item);
    }

    if (duplicateItems.length > 0) {
      issues.push(`item-clause:${Array.from(new Set(duplicateItems)).join(",")}`);
    }
  }

  return issues;
}

function collectRecommendedModeIssues(team, modes, format) {
  const formatProfile = getCompetitiveFormatProfile(format);
  if (!formatProfile.requireRecommendedModes) {
    return [];
  }

  const resolvedModes = Array.isArray(modes) ? modes : [];
  if (resolvedModes.length === 0) {
    return ["missing"];
  }

  const issues = [];
  const teamNames = new Set(team.map((member) => member.name));

  if (!resolvedModes.some((mode) => /standard/i.test(mode.title || ""))) {
    issues.push("missing-standard-mode");
  }

  resolvedModes.forEach((mode) => {
    const members = Array.isArray(mode.members) ? mode.members.filter(Boolean) : [];
    const uniqueMembers = Array.from(new Set(members));

    if (members.length < 3 || members.length > 4) {
      issues.push(`${mode.title || "mode"}:invalid-size:${members.length}`);
    }
    if (uniqueMembers.length !== members.length) {
      issues.push(`${mode.title || "mode"}:duplicate-members`);
    }

    const missingMembers = uniqueMembers.filter((member) => !teamNames.has(member));
    if (missingMembers.length > 0) {
      issues.push(`${mode.title || "mode"}:unknown-members:${missingMembers.join(",")}`);
    }
  });

  return issues;
}

function collectTournamentPriorIssues(result, testCase) {
  const diagnostics = result.generationDiagnostics?.tournamentPriors;
  const issues = [];

  if (
    testCase.requireTournamentPriorModeCoverage ||
    (Array.isArray(testCase.requiredActivePackages) && testCase.requiredActivePackages.length > 0) ||
    (Array.isArray(testCase.requiredActiveLeadPairs) && testCase.requiredActiveLeadPairs.length > 0)
  ) {
    if (!diagnostics) {
      return ["missing-diagnostics"];
    }
  }

  if (Array.isArray(testCase.requiredActivePackages) && testCase.requiredActivePackages.length > 0) {
    const activePackages = diagnostics?.activePackages ?? [];
    const missing = testCase.requiredActivePackages.filter(
      (packageId) => !activePackages.includes(packageId)
    );
    if (missing.length > 0) {
      issues.push(`active-packages:${missing.join(",")}`);
    }
  }

  if (Array.isArray(testCase.requiredActiveLeadPairs) && testCase.requiredActiveLeadPairs.length > 0) {
    const activeLeadPairs = diagnostics?.activeLeadPairs ?? [];
    const missing = testCase.requiredActiveLeadPairs.filter(
      (pairId) => !activeLeadPairs.includes(pairId)
    );
    if (missing.length > 0) {
      issues.push(`active-lead-pairs:${missing.join(",")}`);
    }
  }

  if (testCase.requireTournamentPriorModeCoverage) {
    const coverage = getTournamentPriorModeCoverage({
      format: testCase.format,
      templateId: testCase.templateId,
      team: result.team,
      recommendedModes: result.recommendedModes ?? result.teamGuide?.recommendedModes,
    });

    if (!coverage) {
      issues.push("coverage:missing");
    } else {
      if (coverage.issues.length > 0) {
        issues.push(`coverage:${coverage.issues.join(",")}`);
      }
      if (coverage.modeMatch === "none" || coverage.modeMatch === "conflict") {
        issues.push(`mode-match:${coverage.modeMatch}`);
      }
    }
  }

  return issues;
}

function getFeasibilityDiagnostics(result) {
  return result.generationDiagnostics?.feasibility ?? {
    infeasibleSupportPackages: [],
    infeasibleCore: [],
  };
}

function buildFixtureData(fixture) {
  if (fixture === "vgc-prior-tailwind-sparse") {
    return {
      meta: {
        format: "gen9vgc2026f",
        totalBattles: 100000,
        leadData: {},
        sourceInfo: {
          provider: "local",
          requestedFormat: "gen9vgc2026f",
          resolvedFormat: "gen9vgc2026f",
          month: "fixture",
          rating: 1760,
          fallbackType: "manual",
        },
      },
      pokemon: {
        whimsicott: {
          name: "Whimsicott",
          usageRate: 0.04,
          teammates: {},
          moves: { tailwind: 0.92, moonblast: 0.61, encore: 0.58, helpinghand: 0.52 },
          items: { focussash: 0.8 },
          abilities: { prankster: 1 },
          teraTypes: { ghost: 0.55 },
          spreads: [{ nature: "Timid", evs: [4, 0, 0, 252, 0, 252], percentage: 1 }],
        },
        regidrago: {
          name: "Regidrago",
          usageRate: 0.038,
          teammates: {},
          moves: { dragonenergy: 0.89, dracometeor: 0.63, protect: 0.54, earthpower: 0.41 },
          items: { dragonsfang: 0.56, choicespecs: 0.24 },
          abilities: { dragonsmaw: 1 },
          teraTypes: { dragon: 0.74 },
          spreads: [{ nature: "Timid", evs: [4, 0, 0, 252, 0, 252], percentage: 1 }],
        },
        gholdengo: {
          name: "Gholdengo",
          usageRate: 0.034,
          teammates: {},
          moves: { makeitrain: 0.84, shadowball: 0.71, nastyplot: 0.43, protect: 0.41 },
          items: { lifeorb: 0.47, metalcoat: 0.2 },
          abilities: { goodasgold: 1 },
          teraTypes: { steel: 0.61 },
          spreads: [{ nature: "Modest", evs: [4, 0, 0, 252, 0, 252], percentage: 1 }],
        },
        ogerponcornerstone: {
          name: "Ogerpon-Cornerstone",
          usageRate: 0.033,
          teammates: {},
          moves: { ivycudgel: 0.85, hornleech: 0.71, spikyshield: 0.55, followme: 0.39 },
          items: { cornerstoneMask: 1 },
          abilities: { sturdy: 1 },
          teraTypes: { rock: 1 },
          spreads: [{ nature: "Jolly", evs: [4, 252, 0, 0, 0, 252], percentage: 1 }],
        },
        incineroar: {
          name: "Incineroar",
          usageRate: 0.03,
          teammates: {},
          moves: { fakeout: 0.87, partingshot: 0.8, flareblitz: 0.6, knockoff: 0.5 },
          items: { sitrusberry: 0.7 },
          abilities: { intimidate: 1 },
          teraTypes: { grass: 0.35 },
          spreads: [{ nature: "Careful", evs: [244, 4, 100, 0, 156, 4], percentage: 1 }],
        },
        amoonguss: {
          name: "Amoonguss",
          usageRate: 0.028,
          teammates: {},
          moves: { spore: 0.86, ragepowder: 0.74, pollenpuff: 0.59, protect: 0.43 },
          items: { rockyhelmet: 0.38, sitrusberry: 0.24 },
          abilities: { regenerator: 1 },
          teraTypes: { water: 0.42 },
          spreads: [{ nature: "Calm", evs: [236, 0, 156, 0, 116, 0], percentage: 1 }],
        },
      },
    };
  }

  if (fixture === "vgc-prior-trickroom-sparse") {
    return {
      meta: {
        format: "gen9vgc2026f",
        totalBattles: 100000,
        leadData: {},
        sourceInfo: {
          provider: "local",
          requestedFormat: "gen9vgc2026f",
          resolvedFormat: "gen9vgc2026f",
          month: "fixture",
          rating: 1760,
          fallbackType: "manual",
        },
      },
      pokemon: {
        cresselia: {
          name: "Cresselia",
          usageRate: 0.04,
          teammates: {},
          moves: { trickroom: 0.9, lunarblessing: 0.62, icebeam: 0.46, helpinghand: 0.43 },
          items: { safetygoggles: 0.52, sitrusberry: 0.23 },
          abilities: { levitate: 1 },
          teraTypes: { fairy: 0.51 },
          spreads: [{ nature: "Sassy", evs: [252, 0, 156, 0, 100, 0], percentage: 1 }],
        },
        ursaluna: {
          name: "Ursaluna",
          usageRate: 0.038,
          teammates: {},
          moves: { facade: 0.84, headlongrush: 0.77, protect: 0.55, swordsdance: 0.31 },
          items: { flameorb: 0.92 },
          abilities: { guts: 1 },
          teraTypes: { normal: 0.81 },
          spreads: [{ nature: "Brave", evs: [252, 252, 0, 0, 4, 0], percentage: 1 }],
        },
        incineroar: {
          name: "Incineroar",
          usageRate: 0.034,
          teammates: {},
          moves: { fakeout: 0.87, partingshot: 0.8, flareblitz: 0.6, knockoff: 0.5 },
          items: { sitrusberry: 0.7 },
          abilities: { intimidate: 1 },
          teraTypes: { grass: 0.35 },
          spreads: [{ nature: "Careful", evs: [244, 4, 100, 0, 156, 4], percentage: 1 }],
        },
        amoonguss: {
          name: "Amoonguss",
          usageRate: 0.033,
          teammates: {},
          moves: { spore: 0.86, ragepowder: 0.74, pollenpuff: 0.59, protect: 0.43 },
          items: { rockyhelmet: 0.38, sitrusberry: 0.24 },
          abilities: { regenerator: 1 },
          teraTypes: { water: 0.42 },
          spreads: [{ nature: "Calm", evs: [236, 0, 156, 0, 116, 0], percentage: 1 }],
        },
        urshifurapidstrike: {
          name: "Urshifu-Rapid-Strike",
          usageRate: 0.03,
          teammates: {},
          moves: { surgingstrikes: 0.85, closecombat: 0.67, aquajet: 0.41, protect: 0.35 },
          items: { mysticwater: 0.44, choiceband: 0.21 },
          abilities: { unseenfist: 1 },
          teraTypes: { water: 0.69 },
          spreads: [{ nature: "Jolly", evs: [4, 252, 0, 0, 0, 252], percentage: 1 }],
        },
        fluttermane: {
          name: "Flutter Mane",
          usageRate: 0.029,
          teammates: {},
          moves: { moonblast: 0.88, shadowball: 0.78, icywind: 0.37, protect: 0.33 },
          items: { boosterenergy: 0.57, focussash: 0.23 },
          abilities: { protosynthesis: 1 },
          teraTypes: { fairy: 0.62 },
          spreads: [{ nature: "Timid", evs: [4, 0, 0, 252, 0, 252], percentage: 1 }],
        },
      },
    };
  }

  return undefined;
}

function incrementCounter(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

async function runCase(testCase, iterations) {
  const expectedTeamSize = FORMATS[testCase.format].maxTeamSize;
  const safeTemplateId = sanitizeTemplateForFormat(
    testCase.templateId,
    testCase.format
  );
  const template = TEMPLATES[safeTemplateId];
  const failureCounts = new Map();
  const iterationResults = [];
  let passedRuns = 0;

  for (let index = 0; index < iterations; index += 1) {
    try {
      const result = await generateDynamicTeam({
        format: testCase.format,
        templateId: safeTemplateId,
        lang: "en",
        dataOverride: buildFixtureData(testCase.fixture),
        rngSeed: `${testCase.id}:${index}`,
      });

      const validation = validateTeamForTemplate(result.team, result.teamGuide, {
        format: testCase.format,
        templateId: safeTemplateId,
        template,
        feasibility: getFeasibilityDiagnostics(result),
      });
      const coherenceIssues = collectSetCoherenceIssues(result.team, testCase.format);
      const formatRuleIssues = collectFormatRuleIssues(result.team, testCase.format);
      const recommendedModeIssues = collectRecommendedModeIssues(
        result.team,
        result.recommendedModes ?? result.teamGuide?.recommendedModes,
        testCase.format
      );
      const tournamentPriorIssues = collectTournamentPriorIssues(result, testCase);
      const failures = [];

      if (result.team.length !== expectedTeamSize) {
        failures.push(`team-size:${result.team.length}/${expectedTeamSize}`);
      }
      if (validation.score < testCase.minValidationScore) {
        failures.push(
          `validation-score:${validation.score.toFixed(2)}<${testCase.minValidationScore.toFixed(2)}`
        );
      }
      if ((testCase.maxMissingSupport ?? 99) < validation.missingSupportPackages.length) {
        failures.push(
          `missing-support:${validation.missingSupportPackages.join(",") || "n/a"}`
        );
      }
      if (testCase.requireCleanCore && validation.missingCore.length > 0) {
        failures.push(`missing-core:${validation.missingCore.join(",")}`);
      }
      if (
        Array.isArray(testCase.allowedArchetypes) &&
        !testCase.allowedArchetypes.includes(result.archetype)
      ) {
        failures.push(`archetype:${result.archetype || "n/a"}`);
      }
      if (validation.issues.some((issue) => issue.startsWith("forbidden-pattern:"))) {
        failures.push(
          `forbidden:${validation.issues
            .filter((issue) => issue.startsWith("forbidden-pattern:"))
            .join(",")}`
        );
      }
      if (testCase.requireRecommendedModes && !(result.recommendedModes || []).length) {
        failures.push("recommended-modes:missing");
      }
      if (
        testCase.requireResolvedFormat &&
        result.dataProvenance?.provider !== "local" &&
        result.dataProvenance?.resolvedFormat !== testCase.requireResolvedFormat
      ) {
        failures.push(
          `resolved-format:${result.dataProvenance?.resolvedFormat || "n/a"}`
        );
      }
      if (coherenceIssues.length > 0) {
        failures.push(`set-coherence:${coherenceIssues.join(",")}`);
      }
      if (formatRuleIssues.length > 0) {
        failures.push(`format-rules:${formatRuleIssues.join(",")}`);
      }
      if (recommendedModeIssues.length > 0) {
        failures.push(`recommended-modes:${recommendedModeIssues.join(",")}`);
      }
      if (tournamentPriorIssues.length > 0) {
        failures.push(`tournament-priors:${tournamentPriorIssues.join(",")}`);
      }

      if (failures.length === 0) {
        passedRuns += 1;
      } else {
        failures.forEach((failure) => incrementCounter(failureCounts, failure));
      }

      iterationResults.push({
        ok: failures.length === 0,
        validationScore: validation.score,
        archetype: result.archetype,
        subarchetype: result.subarchetype,
        failures,
        resolvedFormat: result.dataProvenance?.resolvedFormat || result.dataProvenance?.requestedFormat,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      incrementCounter(failureCounts, `exception:${message}`);
      iterationResults.push({
        ok: false,
        validationScore: 0,
        archetype: "n/a",
        subarchetype: "n/a",
        failures: [`exception:${message}`],
        resolvedFormat: "n/a",
      });
    }
  }

  const passRate = passedRuns / iterations;
  return {
    ...testCase,
    iterations,
    passRate,
    passedRuns,
    failedRuns: iterations - passedRuns,
    success: passRate >= testCase.minPassRate,
    failureCounts: Array.from(failureCounts.entries()).sort((a, b) => b[1] - a[1]),
    iterationResults,
  };
}

function printCaseResult(result) {
  const status = result.success ? "PASS" : "FAIL";
  console.log(
    `\n[${status}] ${result.id} | ${result.format} | ${result.templateId} | pass rate ${result.passedRuns}/${result.iterations} (${(result.passRate * 100).toFixed(0)}%)`
  );

  const sample = result.iterationResults[0];
  if (sample) {
    console.log(
      `  sample -> archetype=${sample.archetype || "n/a"} | subarchetype=${sample.subarchetype || "n/a"} | source=${sample.resolvedFormat || "n/a"}`
    );
  }

  if (result.failureCounts.length > 0) {
    console.log("  top failures:");
    result.failureCounts.slice(0, 5).forEach(([failure, count]) => {
      console.log(`    - ${count}x ${failure}`);
    });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const selectedCases = args.caseId
    ? STYLE_MATRIX.filter((testCase) => testCase.id === args.caseId)
    : STYLE_MATRIX;

  if (selectedCases.length === 0) {
    console.error(`No style test case found for --case=${args.caseId}`);
    process.exit(1);
  }

  console.log("=========================================");
  console.log("      STYLE CONFIGURATION TEST MATRIX    ");
  console.log("=========================================");
  console.log(`Cases: ${selectedCases.length} | Iterations per case: ${args.iterations}`);

  let hasFailures = false;
  for (const testCase of selectedCases) {
    const result = await runCase(testCase, args.iterations);
    printCaseResult(result);
    if (!result.success) {
      hasFailures = true;
    }
  }

  console.log("\n=========================================");
  console.log(hasFailures ? "     STYLE MATRIX FAILED" : "     STYLE MATRIX PASSED");
  console.log("=========================================");

  if (hasFailures) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
