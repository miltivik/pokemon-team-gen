/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const jiti = require("jiti")(__filename, {
  interopDefault: true,
  alias: {
    "@": rootDir,
    "@/": `${rootDir}${path.sep}`,
  },
});

const { FORMATS } = jiti(path.join(rootDir, "config/formats.ts"));
const { sanitizeTemplateForFormat } = jiti(
  path.join(rootDir, "config/templates.ts")
);
const { getMoveData } = jiti(path.join(rootDir, "lib/showdown-data.ts"));
const { generateDynamicTeam } = jiti(path.join(rootDir, "lib/dynamic-builder.ts"));
const { isLegendaryOrParadoxSpecies } = jiti(
  path.join(rootDir, "lib/pokemon-classification.ts")
);
const { getCanonicalSpeciesId } = jiti(path.join(rootDir, "lib/pokemon-forms.ts"));

const TYPE_MATRIX = [
  {
    id: "ou-electric-no-legends",
    format: "gen9ou",
    templateId: "balanced",
    type: "electric",
    excludeLegendaries: true,
  },
  {
    id: "ou-electric-sparse-meta",
    format: "gen9ou",
    templateId: "balanced",
    type: "electric",
    excludeLegendaries: true,
    fixture: "sparse-electric-ou",
  },
  {
    id: "ou-dragon-no-legends",
    format: "gen9ou",
    templateId: "balanced",
    type: "dragon",
    excludeLegendaries: true,
  },
  {
    id: "ou-grass-no-legends",
    format: "gen9ou",
    templateId: "balanced",
    type: "grass",
    excludeLegendaries: true,
  },
  {
    id: "ou-fire-no-legends",
    format: "gen9ou",
    templateId: "balanced",
    type: "fire",
    excludeLegendaries: true,
  },
  {
    id: "monotype-electric",
    format: "gen9monotype",
    templateId: "balanced",
    type: "electric",
    excludeLegendaries: false,
  },
  {
    id: "monotype-dragon",
    format: "gen9monotype",
    templateId: "balanced",
    type: "dragon",
    excludeLegendaries: false,
  },
  {
    id: "monotype-grass",
    format: "gen9monotype",
    templateId: "balanced",
    type: "grass",
    excludeLegendaries: false,
  },
  {
    id: "monotype-fire",
    format: "gen9monotype",
    templateId: "balanced",
    type: "fire",
    excludeLegendaries: false,
  },
  {
    id: "dou-electric-no-legends",
    format: "gen9doublesou",
    templateId: "balanced",
    type: "electric",
    excludeLegendaries: true,
  },
  {
    id: "vgc-water-no-legends",
    format: "gen9vgc2026f",
    templateId: "balanced",
    type: "water",
    excludeLegendaries: true,
  },
  {
    id: "ou-rotom-fixed-family-conflict",
    format: "gen9ou",
    templateId: "balanced",
    excludeLegendaries: true,
    fixedMembers: ["Rotom-Wash", "Rotom-Fan"],
    expectedMembers: ["Rotom-Wash"],
    forbiddenMembers: ["Rotom-Fan"],
  },
  {
    id: "ou-urshifu-fixed-family-conflict",
    format: "gen9ou",
    templateId: "balanced",
    excludeLegendaries: false,
    fixedMembers: ["Urshifu", "Urshifu-Rapid-Strike"],
    expectedMembers: ["Urshifu"],
    forbiddenMembers: ["Urshifu-Rapid-Strike"],
  },
  {
    id: "ou-electivire-fallback-quality",
    format: "gen9ou",
    templateId: "balanced",
    type: "electric",
    excludeLegendaries: true,
    fixedMembers: ["Electivire"],
    fixture: "sparse-electric-ou",
    expectedMembers: ["Electivire"],
    forbiddenRoles: {
      Electivire: ["Tank", "Wall", "Support"],
    },
    requiredMoveTypes: {
      Electivire: ["Electric"],
    },
    minAttackMoves: {
      Electivire: 3,
    },
  },
];

function parseArgs(argv) {
  const args = {
    iterations: 3,
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

function incrementCounter(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function getMemberTypes(member) {
  return Array.isArray(member?.types)
    ? member.types.map((type) => String(type))
    : [];
}

function hasRequestedType(member, requestedType) {
  const requested = String(requestedType || "").toLowerCase();
  return getMemberTypes(member).some((type) => type.toLowerCase() === requested);
}

function formatMemberSummary(member) {
  const types = getMemberTypes(member).join("/") || "unknown";
  return `${member.name} (${types})`;
}

function getMoveNames(member) {
  return Array.isArray(member?.moves)
    ? member.moves
        .map((move) => (typeof move === "string" ? move : move?.name))
        .filter(Boolean)
    : [];
}

function getAttackMoveCount(member) {
  return Array.isArray(member?.moves)
    ? member.moves.filter((move) => {
        const resolvedMove =
          typeof move === "string" ? getMoveData(move) : move;
        if (!resolvedMove) return false;
        return resolvedMove.category !== "Status";
      }).length
    : 0;
}

function hasMoveType(member, type) {
  return Array.isArray(member?.moves)
    ? member.moves.some((move) => {
        const resolvedMove =
          typeof move === "string" ? getMoveData(move) : move;
        if (!resolvedMove) return false;
        return String(resolvedMove.type || "").toLowerCase() === String(type).toLowerCase();
      })
    : false;
}

async function runCase(testCase, iterations) {
  const expectedTeamSize = FORMATS[testCase.format].maxTeamSize;
  const safeTemplateId = sanitizeTemplateForFormat(
    testCase.templateId,
    testCase.format
  );
  const failureCounts = new Map();
  const iterationResults = [];
  let passedRuns = 0;

  for (let index = 0; index < iterations; index += 1) {
    try {
      const result = await generateDynamicTeam({
        format: testCase.format,
        type: testCase.type,
        excludeLegendaries: testCase.excludeLegendaries,
        fixedMembers: testCase.fixedMembers ?? null,
        templateId: safeTemplateId,
        lang: "en",
        dataOverride: buildFixtureData(testCase.fixture),
      });

      const failures = [];
      const mismatchedMembers = result.team.filter(
        (member) => testCase.type && !hasRequestedType(member, testCase.type)
      );
      const forbiddenMembers = testCase.excludeLegendaries
        ? result.team.filter((member) => isLegendaryOrParadoxSpecies(member.name))
        : [];
      const canonicalIds = result.team.map((member) => getCanonicalSpeciesId(member.name));
      const duplicateCanonicalFamilies = canonicalIds.filter(
        (canonicalId, memberIndex) => canonicalIds.indexOf(canonicalId) !== memberIndex
      );
      const incompleteMoveSets = result.team.filter((member) => {
        const moves = getMoveNames(member);
        const uniqueMoves = new Set(moves.map((move) => String(move).trim().toLowerCase()));
        return uniqueMoves.size < 4;
      });

      if (result.team.length !== expectedTeamSize) {
        failures.push(`team-size:${result.team.length}/${expectedTeamSize}`);
      }
      if (mismatchedMembers.length > 0) {
        failures.push(
          `type-mismatch:${mismatchedMembers.map(formatMemberSummary).join(",")}`
        );
      }
      if (forbiddenMembers.length > 0) {
        failures.push(
          `legendary-filter:${forbiddenMembers.map((member) => member.name).join(",")}`
        );
      }
      if (duplicateCanonicalFamilies.length > 0) {
        failures.push(`canonical-duplicate:${duplicateCanonicalFamilies.join(",")}`);
      }
      if (incompleteMoveSets.length > 0) {
        failures.push(
          `incomplete-moves:${incompleteMoveSets
            .map((member) => `${member.name}:${getMoveNames(member).join("|") || "none"}`)
            .join(",")}`
        );
      }
      if (Array.isArray(testCase.expectedMembers)) {
        const missingExpected = testCase.expectedMembers.filter(
          (memberName) => !result.team.some((member) => member.name === memberName)
        );
        if (missingExpected.length > 0) {
          failures.push(`missing-expected:${missingExpected.join(",")}`);
        }
      }
      if (Array.isArray(testCase.forbiddenMembers)) {
        const presentForbidden = testCase.forbiddenMembers.filter((memberName) =>
          result.team.some((member) => member.name === memberName)
        );
        if (presentForbidden.length > 0) {
          failures.push(`forbidden-member:${presentForbidden.join(",")}`);
        }
      }
      if (testCase.forbiddenRoles) {
        for (const [memberName, roles] of Object.entries(testCase.forbiddenRoles)) {
          const member = result.team.find((teamMember) => teamMember.name === memberName);
          if (member && roles.includes(member.role)) {
            failures.push(`forbidden-role:${member.name}:${member.role}`);
          }
        }
      }
      if (testCase.requiredMoveTypes) {
        for (const [memberName, types] of Object.entries(testCase.requiredMoveTypes)) {
          const member = result.team.find((teamMember) => teamMember.name === memberName);
          if (member) {
            const missingTypes = types.filter((type) => !hasMoveType(member, type));
            if (missingTypes.length > 0) {
              failures.push(`missing-move-type:${member.name}:${missingTypes.join(",")}`);
            }
          }
        }
      }
      if (testCase.minAttackMoves) {
        for (const [memberName, minAttackMoves] of Object.entries(testCase.minAttackMoves)) {
          const member = result.team.find((teamMember) => teamMember.name === memberName);
          if (member && getAttackMoveCount(member) < Number(minAttackMoves)) {
            failures.push(`low-attack-count:${member.name}:${getAttackMoveCount(member)}/${minAttackMoves}`);
          }
        }
      }

      if (failures.length === 0) {
        passedRuns += 1;
      } else {
        failures.forEach((failure) => incrementCounter(failureCounts, failure));
      }

      iterationResults.push({
        ok: failures.length === 0,
        failures,
        archetype: result.archetype,
        members: result.team.map(formatMemberSummary),
        source:
          result.dataProvenance?.provider === "smogon"
            ? `${result.dataProvenance.provider}:${result.dataProvenance.resolvedFormat}`
            : `${result.dataProvenance?.provider || "unknown"}:${result.dataProvenance?.requestedFormat || "n/a"}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      incrementCounter(failureCounts, `exception:${message}`);
      iterationResults.push({
        ok: false,
        failures: [`exception:${message}`],
        archetype: "n/a",
        members: [],
        source: "n/a",
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
    success: passedRuns === iterations,
    failureCounts: Array.from(failureCounts.entries()).sort((a, b) => b[1] - a[1]),
    iterationResults,
  };
}

function buildFixtureData(fixture) {
  if (!fixture) {
    return undefined;
  }

  if (fixture === "sparse-electric-ou") {
    return {
      meta: {
        format: "gen9ou",
        totalBattles: 100000,
        leadData: {},
        sourceInfo: {
          provider: "smogon",
          requestedFormat: "gen9ou",
          resolvedFormat: "gen9ou",
          month: "fixture",
          rating: 1760,
          fallbackType: "exact",
        },
      },
      pokemon: {
        magnezone: {
          name: "Magnezone",
          usageRate: 0.031,
          teammates: {},
          moves: {
            thunderbolt: 0.71,
            volswitch: 0.65,
            flashcannon: 0.58,
            terablast: 0.44,
          },
          items: {
            choicespecs: 0.67,
            leftovers: 0.18,
          },
          abilities: {
            analytic: 0.76,
            magnetpull: 0.21,
          },
          teraTypes: {
            flying: 0.41,
            grass: 0.19,
          },
          spreads: [
            {
              nature: "Modest",
              evs: [0, 0, 4, 252, 0, 252],
              percentage: 0.82,
            },
          ],
        },
        rotomwash: {
          name: "Rotom-Wash",
          usageRate: 0.028,
          teammates: {},
          moves: {
            volswitch: 0.88,
            hydropump: 0.77,
            painsplit: 0.46,
            willowisp: 0.43,
          },
          items: {
            leftovers: 0.79,
            heavydutyboots: 0.11,
          },
          abilities: {
            levitate: 1,
          },
          teraTypes: {
            grass: 0.32,
            fairy: 0.18,
          },
          spreads: [
            {
              nature: "Bold",
              evs: [252, 0, 216, 0, 0, 40],
              percentage: 0.74,
            },
          ],
        },
      },
    };
  }

  throw new Error(`Unknown fixture: ${fixture}`);
}

function printCaseResult(result) {
  const status = result.success ? "PASS" : "FAIL";
  console.log(
    `\n[${status}] ${result.id} | ${result.format} | type=${result.type} | pass rate ${result.passedRuns}/${result.iterations} (${(result.passRate * 100).toFixed(0)}%)`
  );

  const sample = result.iterationResults[0];
  if (sample) {
    console.log(
      `  sample -> archetype=${sample.archetype || "n/a"} | source=${sample.source}`
    );
    console.log(`  members -> ${sample.members.join(" | ")}`);
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
    ? TYPE_MATRIX.filter((testCase) => testCase.id === args.caseId)
    : TYPE_MATRIX;

  if (selectedCases.length === 0) {
    console.error(`No type test case found for --case=${args.caseId}`);
    process.exit(1);
  }

  console.log("=========================================");
  console.log("        TYPE SELECTOR TEST MATRIX        ");
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
  console.log(hasFailures ? "      TYPE MATRIX FAILED" : "      TYPE MATRIX PASSED");
  console.log("=========================================");

  if (hasFailures) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
