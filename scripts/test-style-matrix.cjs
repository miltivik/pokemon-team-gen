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

  for (const member of team) {
    const moveNames = getMoveNames(member);
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

  return issues;
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
      });

      const validation = validateTeamForTemplate(result.team, result.teamGuide, {
        format: testCase.format,
        templateId: safeTemplateId,
        template,
      });
      const coherenceIssues = collectSetCoherenceIssues(result.team, testCase.format);
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
