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
const { getCompetitiveFormatProfile } = jiti(
  path.join(rootDir, "lib/competitive-format-profile.ts")
);
const { isAllowedInFormat } = jiti(path.join(rootDir, "lib/format-rules.ts"));
const { getTournamentPriorModeCoverage } = jiti(
  path.join(rootDir, "lib/tournament-priors.ts")
);
const { getMoveData } = jiti(path.join(rootDir, "lib/showdown-data.ts"));
const { generateDynamicTeam } = jiti(path.join(rootDir, "lib/dynamic-builder.ts"));
const { isLegendaryOrParadoxSpecies } = jiti(
  path.join(rootDir, "lib/pokemon-classification.ts")
);
const { getCanonicalSpeciesId } = jiti(path.join(rootDir, "lib/pokemon-forms.ts"));

function toID(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

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
    id: "dou-sneasler-fixed-fallback-quality",
    format: "gen9doublesou",
    templateId: "offense",
    excludeLegendaries: false,
    minTeamSize: 1,
    fixedMembers: ["Sneasler"],
    fixture: "sparse-sneasler-doubles",
    expectedMembers: ["Sneasler"],
    requiredMoveTypes: {
      Sneasler: ["Fighting", "Poison"],
    },
    minAttackMoves: {
      Sneasler: 2,
    },
  },
  {
    id: "vgc-water-no-legends",
    format: "gen9vgc2026f",
    templateId: "balanced",
    type: "water",
    excludeLegendaries: true,
  },
  {
    id: "vgc-regf-offline-legal-pool",
    format: "gen9vgc2026f",
    templateId: "balanced",
    excludeLegendaries: false,
    fixture: "vgc-regf-local-legality",
    minTeamSize: 4,
    expectedProvider: "local",
    forbiddenMembers: ["Ho-Oh", "Jirachi"],
  },
  {
    id: "vgc-whimsicott-fixed-prior-tailwind",
    format: "gen9vgc2026f",
    templateId: "tailwind",
    excludeLegendaries: false,
    fixedMembers: ["Whimsicott"],
    fixture: "vgc-prior-tailwind-sparse",
    expectedMembers: ["Whimsicott", "Regidrago", "Gholdengo"],
    requiredMoves: {
      Whimsicott: ["Tailwind"],
    },
    requiredRecommendedModeMembers: [["Whimsicott", "Regidrago"]],
    requiredActiveLeadPairs: ["vgc-regf-lead-whimsi-regidrago"],
  },
  {
    id: "vgc-cresselia-fixed-prior-trickroom",
    format: "gen9vgc2026f",
    templateId: "trickroom",
    excludeLegendaries: false,
    fixedMembers: ["Cresselia"],
    fixture: "vgc-prior-trickroom-sparse",
    expectedMembers: ["Cresselia", "Ursaluna", "Incineroar"],
    requiredMoves: {
      Cresselia: ["Trick Room"],
    },
    requiredRecommendedModeMembers: [["Cresselia", "Ursaluna"]],
    requiredActiveLeadPairs: ["vgc-regf-lead-cress-ursaluna"],
  },
  {
    id: "vgc-sneasler-fixed-fallback-quality",
    format: "gen9vgc2026f",
    templateId: "offense",
    excludeLegendaries: false,
    minTeamSize: 1,
    fixedMembers: ["Sneasler"],
    fixture: "sparse-sneasler-doubles",
    expectedMembers: ["Sneasler"],
    requiredMoveTypes: {
      Sneasler: ["Fighting", "Poison"],
    },
    minAttackMoves: {
      Sneasler: 2,
    },
  },
  {
    id: "dou-gen8-dragonite-fixed-fallback-quality",
    format: "gen8doublesou",
    templateId: "offense",
    excludeLegendaries: false,
    minTeamSize: 1,
    fixedMembers: ["Dragonite"],
    fixture: "sparse-dragonite-doubles",
    expectedMembers: ["Dragonite"],
    requiredMoveTypes: {
      Dragonite: ["Dragon"],
    },
    minAttackMoves: {
      Dragonite: 2,
    },
  },
  {
    id: "dou-protect-soft-cap",
    format: "gen9doublesou",
    templateId: "offense",
    excludeLegendaries: false,
    fixedMembers: [
      "Terrakion",
      "Zapdos",
      "Salamence",
      "Great Tusk",
      "Enamorus",
      "Mamoswine",
    ],
    fixture: "sparse-doubles-protect-overload",
    expectedMembers: [
      "Terrakion",
      "Zapdos",
      "Salamence",
      "Great Tusk",
      "Enamorus",
      "Mamoswine",
    ],
    maxMoveUsers: {
      Protect: 4,
    },
  },
  {
    id: "dou-zapdos-structured-role",
    format: "gen9doublesou",
    templateId: "tailwind",
    excludeLegendaries: false,
    minTeamSize: 1,
    fixedMembers: ["Zapdos"],
    fixture: "sparse-doubles-protect-overload",
    expectedMembers: ["Zapdos"],
    requiredMoveTypes: {
      Zapdos: ["Electric"],
    },
    requiredMoves: {
      Zapdos: ["Tailwind"],
    },
    minAttackMoves: {
      Zapdos: 2,
    },
  },
  {
    id: "dou-terrakion-structured-role",
    format: "gen9doublesou",
    templateId: "offense",
    excludeLegendaries: false,
    minTeamSize: 1,
    fixedMembers: ["Terrakion"],
    fixture: "sparse-doubles-protect-overload",
    expectedMembers: ["Terrakion"],
    requiredMoveTypes: {
      Terrakion: ["Rock", "Fighting"],
    },
    minAttackMoves: {
      Terrakion: 2,
    },
  },
  {
    id: "dou-salamence-structured-role",
    format: "gen9doublesou",
    templateId: "tailwind",
    excludeLegendaries: false,
    minTeamSize: 1,
    fixedMembers: ["Salamence"],
    fixture: "sparse-doubles-protect-overload",
    expectedMembers: ["Salamence"],
    requiredMoves: {
      Salamence: ["Tailwind"],
    },
    minAttackMoves: {
      Salamence: 2,
    },
  },
  {
    id: "dou-metagross-generic-structure",
    format: "gen9doublesou",
    templateId: "offense",
    excludeLegendaries: false,
    minTeamSize: 1,
    fixedMembers: ["Metagross"],
    fixture: "sparse-metagross-doubles",
    expectedMembers: ["Metagross"],
    requiredMoveTypes: {
      Metagross: ["Steel"],
    },
    minAttackMoves: {
      Metagross: 2,
    },
    forbiddenMoves: {
      Metagross: ["Steel Roller", "Meteor Beam", "Fly", "Bounce"],
    },
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

function countMoveUsers(team, moveName) {
  const requestedMoveId = toID(moveName);
  return team.filter((member) =>
    getMoveNames(member).some((candidateMove) => toID(candidateMove) === requestedMoveId)
  ).length;
}

function hasRequiredMoves(member, moves) {
  const moveIds = new Set(getMoveNames(member).map(toID));
  return moves.every((moveName) => moveIds.has(toID(moveName)));
}

function hasForbiddenMoves(member, moves) {
  const moveIds = new Set(getMoveNames(member).map(toID));
  return moves.some((moveName) => moveIds.has(toID(moveName)));
}

function modeContainsMembers(mode, requiredMembers) {
  const modeMembers = new Set((mode?.members ?? []).map((member) => String(member)));
  return requiredMembers.every((memberName) => modeMembers.has(memberName));
}

function collectFormatIssues(team, format) {
  const formatProfile = getCompetitiveFormatProfile(format);
  if (!formatProfile.isDoubles && !formatProfile.isVgc) {
    return [];
  }

  const issues = [];
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

async function runCase(testCase, iterations) {
  const expectedTeamSize = FORMATS[testCase.format].maxTeamSize;
  const minimumTeamSize = testCase.minTeamSize ?? expectedTeamSize;
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
      const formatIssues = collectFormatIssues(result.team, testCase.format);
      const recommendedModes = result.recommendedModes ?? result.teamGuide?.recommendedModes ?? [];
      const tournamentPriorCoverage = getTournamentPriorModeCoverage({
        format: testCase.format,
        templateId: safeTemplateId,
        team: result.team,
        recommendedModes,
      });
      const incompleteMoveSets = result.team.filter((member) => {
        const moves = getMoveNames(member);
        const uniqueMoves = new Set(moves.map((move) => String(move).trim().toLowerCase()));
        return uniqueMoves.size < 4;
      });

      if (result.team.length < minimumTeamSize) {
        failures.push(`team-size:${result.team.length}/${minimumTeamSize}`);
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
      if (formatIssues.length > 0) {
        failures.push(`format-rules:${formatIssues.join(",")}`);
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
      if (testCase.requiredMoves) {
        for (const [memberName, requiredMoves] of Object.entries(testCase.requiredMoves)) {
          const member = result.team.find((teamMember) => teamMember.name === memberName);
          if (member && !hasRequiredMoves(member, requiredMoves)) {
            failures.push(`missing-required-moves:${member.name}:${requiredMoves.join(",")}`);
          }
        }
      }
      if (Array.isArray(testCase.requiredRecommendedModeMembers)) {
        for (const requiredMembers of testCase.requiredRecommendedModeMembers) {
          const hasMatchingMode = recommendedModes.some((mode) =>
            modeContainsMembers(mode, requiredMembers)
          );
          if (!hasMatchingMode) {
            failures.push(`recommended-mode-members:${requiredMembers.join(",")}`);
          }
        }
      }
      if (Array.isArray(testCase.requiredActiveLeadPairs) && testCase.requiredActiveLeadPairs.length > 0) {
        const activeLeadPairs =
          result.generationDiagnostics?.tournamentPriors?.activeLeadPairs ?? [];
        const missingLeadPairs = testCase.requiredActiveLeadPairs.filter(
          (pairId) => !activeLeadPairs.includes(pairId)
        );
        if (missingLeadPairs.length > 0) {
          failures.push(`active-lead-pairs:${missingLeadPairs.join(",")}`);
        }
      }
      if (
        (Array.isArray(testCase.requiredActiveLeadPairs) && testCase.requiredActiveLeadPairs.length > 0) &&
        !tournamentPriorCoverage
      ) {
        failures.push("tournament-priors:missing");
      }
      if (
        (Array.isArray(testCase.requiredActiveLeadPairs) && testCase.requiredActiveLeadPairs.length > 0) &&
        tournamentPriorCoverage &&
        tournamentPriorCoverage.issues.length > 0
      ) {
        failures.push(`tournament-priors:${tournamentPriorCoverage.issues.join(",")}`);
      }
      if (testCase.forbiddenMoves) {
        for (const [memberName, forbiddenMoves] of Object.entries(testCase.forbiddenMoves)) {
          const member = result.team.find((teamMember) => teamMember.name === memberName);
          if (member && hasForbiddenMoves(member, forbiddenMoves)) {
            failures.push(`has-forbidden-moves:${member.name}:${forbiddenMoves.join(",")}`);
          }
        }
      }
      if (testCase.maxMoveUsers) {
        for (const [moveName, maxMoveUsers] of Object.entries(testCase.maxMoveUsers)) {
          const moveUsers = countMoveUsers(result.team, moveName);
          if (moveUsers > Number(maxMoveUsers)) {
            failures.push(`move-overload:${moveName}:${moveUsers}/${maxMoveUsers}`);
          }
        }
      }
      if (
        testCase.expectedProvider &&
        result.dataProvenance?.provider !== testCase.expectedProvider
      ) {
        failures.push(
          `provider:${result.dataProvenance?.provider || "unknown"}/${testCase.expectedProvider}`
        );
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

  if (fixture === "sparse-sneasler-doubles") {
    return {
      meta: {
        format: "gen9doublesou",
        totalBattles: 100000,
        leadData: {},
        sourceInfo: {
          provider: "smogon",
          requestedFormat: "gen9doublesou",
          resolvedFormat: "gen9doublesou",
          month: "fixture",
          rating: 1760,
          fallbackType: "exact",
        },
      },
      pokemon: {
        sneasler: {
          name: "Sneasler",
          usageRate: 0.017,
          teammates: {},
          moves: {
            swordsdance: 0.34,
            bulkup: 0.31,
            trailblaze: 0.29,
            nastyplot: 0.24,
          },
          items: {
            focussash: 0.4,
            lifeorb: 0.2,
          },
          abilities: {
            unburden: 0.61,
            poisontouch: 0.39,
          },
          teraTypes: {
            ghost: 0.51,
          },
          spreads: [
            {
              nature: "Jolly",
              evs: [4, 252, 0, 0, 0, 252],
              percentage: 1,
            },
          ],
        },
      },
    };
  }

  if (fixture === "sparse-dragonite-doubles") {
    return {
      meta: {
        format: "gen8doublesou",
        totalBattles: 100000,
        leadData: {},
        sourceInfo: {
          provider: "smogon",
          requestedFormat: "gen8doublesou",
          resolvedFormat: "gen8doublesou",
          month: "fixture",
          rating: 1760,
          fallbackType: "exact",
        },
      },
      pokemon: {
        dragonite: {
          name: "Dragonite",
          usageRate: 0.021,
          teammates: {},
          moves: {
            dragondance: 0.35,
            agility: 0.31,
            roost: 0.27,
            substitute: 0.26,
          },
          items: {
            lumberry: 0.41,
            weaknesspolicy: 0.19,
          },
          abilities: {
            multiscale: 1,
          },
          teraTypes: {},
          spreads: [
            {
              nature: "Jolly",
              evs: [4, 252, 0, 0, 0, 252],
              percentage: 1,
            },
          ],
        },
      },
    };
  }

  if (fixture === "sparse-doubles-protect-overload") {
    return {
      meta: {
        format: "gen9doublesou",
        totalBattles: 100000,
        leadData: {},
        sourceInfo: {
          provider: "smogon",
          requestedFormat: "gen9doublesou",
          resolvedFormat: "gen9doublesou",
          month: "fixture",
          rating: 1760,
          fallbackType: "exact",
        },
      },
      pokemon: {
        terrakion: {
          name: "Terrakion",
          usageRate: 0.014,
          teammates: {},
          moves: {
            swordsdance: 0.35,
            protect: 0.32,
            zenheadbutt: 0.26,
            rockslide: 0.24,
          },
          items: {
            lifeorb: 0.37,
            focussash: 0.21,
          },
          abilities: {
            justified: 1,
          },
          teraTypes: {
            ghost: 0.49,
          },
          spreads: [
            {
              nature: "Jolly",
              evs: [4, 252, 0, 0, 0, 252],
              percentage: 1,
            },
          ],
        },
        zapdos: {
          name: "Zapdos",
          usageRate: 0.016,
          teammates: {},
          moves: {
            agility: 0.34,
            protect: 0.33,
            heatwave: 0.28,
            thunderwave: 0.24,
          },
          items: {
            sitrusberry: 0.31,
            lifeorb: 0.24,
          },
          abilities: {
            static: 1,
          },
          teraTypes: {
            electric: 0.45,
          },
          spreads: [
            {
              nature: "Timid",
              evs: [4, 0, 0, 252, 0, 252],
              percentage: 1,
            },
          ],
        },
        salamence: {
          name: "Salamence",
          usageRate: 0.015,
          teammates: {},
          moves: {
            dragondance: 0.36,
            protect: 0.33,
            roost: 0.27,
            substitute: 0.23,
          },
          items: {
            lifeorb: 0.34,
            lumberry: 0.2,
          },
          abilities: {
            intimidate: 1,
          },
          teraTypes: {
            steel: 0.42,
          },
          spreads: [
            {
              nature: "Jolly",
              evs: [4, 252, 0, 0, 0, 252],
              percentage: 1,
            },
          ],
        },
        greattusk: {
          name: "Great Tusk",
          usageRate: 0.019,
          teammates: {},
          moves: {
            bulkup: 0.33,
            protect: 0.31,
            rapidspin: 0.27,
            earthpower: 0.22,
          },
          items: {
            leftovers: 0.29,
            assaultvest: 0.24,
          },
          abilities: {
            protosynthesis: 1,
          },
          teraTypes: {
            water: 0.39,
          },
          spreads: [
            {
              nature: "Jolly",
              evs: [4, 252, 0, 0, 0, 252],
              percentage: 1,
            },
          ],
        },
        enamorus: {
          name: "Enamorus",
          usageRate: 0.013,
          teammates: {},
          moves: {
            calmmind: 0.34,
            protect: 0.32,
            springtidestorm: 0.28,
            healingwish: 0.21,
          },
          items: {
            leftovers: 0.27,
            lifeorb: 0.23,
          },
          abilities: {
            contrary: 1,
          },
          teraTypes: {
            steel: 0.46,
          },
          spreads: [
            {
              nature: "Timid",
              evs: [4, 0, 0, 252, 0, 252],
              percentage: 1,
            },
          ],
        },
        mamoswine: {
          name: "Mamoswine",
          usageRate: 0.014,
          teammates: {},
          moves: {
            swordsdance: 0.35,
            protect: 0.34,
            iceshard: 0.29,
            curse: 0.22,
          },
          items: {
            lifeorb: 0.33,
            clearamulet: 0.2,
          },
          abilities: {
            thickfat: 0.7,
            oblivious: 0.3,
          },
          teraTypes: {
            grass: 0.44,
          },
          spreads: [
            {
              nature: "Adamant",
              evs: [4, 252, 0, 0, 0, 252],
              percentage: 1,
            },
          ],
        },
      },
    };
  }

  if (fixture === "sparse-metagross-doubles") {
    return {
      meta: {
        format: "gen9doublesou",
        totalBattles: 100000,
        leadData: {},
        sourceInfo: {
          provider: "smogon",
          requestedFormat: "gen9doublesou",
          resolvedFormat: "gen9doublesou",
          month: "fixture",
          rating: 1760,
          fallbackType: "exact",
        },
      },
      pokemon: {
        metagross: {
          name: "Metagross",
          usageRate: 0.014,
          teammates: {},
          moves: {
            agility: 0.34,
            protect: 0.31,
            zenheadbutt: 0.27,
            meteorbeam: 0.23,
          },
          items: {
            clearamulet: 0.35,
            assaultvest: 0.21,
          },
          abilities: {
            clearbody: 1,
          },
          teraTypes: {
            water: 0.43,
          },
          spreads: [
            {
              nature: "Jolly",
              evs: [4, 252, 0, 0, 0, 252],
              percentage: 1,
            },
          ],
        },
      },
    };
  }

  if (fixture === "vgc-regf-local-legality") {
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
        hooh: {
          name: "Ho-Oh",
          usageRate: 0.12,
          teammates: {},
          moves: {
            sacredfire: 0.7,
            bravebird: 0.63,
            protect: 0.49,
            tailwind: 0.32,
          },
          items: {
            clearamulet: 0.62,
          },
          abilities: {
            regenerator: 1,
          },
          teraTypes: {
            grass: 0.4,
          },
          spreads: [
            {
              nature: "Adamant",
              evs: [236, 76, 4, 0, 4, 188],
              percentage: 1,
            },
          ],
        },
        jirachi: {
          name: "Jirachi",
          usageRate: 0.11,
          teammates: {},
          moves: {
            ironhead: 0.71,
            followme: 0.58,
            helpinghand: 0.43,
            protect: 0.39,
          },
          items: {
            sitrusberry: 0.64,
          },
          abilities: {
            serenegrace: 1,
          },
          teraTypes: {
            water: 0.38,
          },
          spreads: [
            {
              nature: "Careful",
              evs: [252, 4, 116, 0, 132, 4],
              percentage: 1,
            },
          ],
        },
        incineroar: {
          name: "Incineroar",
          usageRate: 0.1,
          teammates: {},
          moves: {
            fakeout: 0.82,
            partingshot: 0.74,
            flareblitz: 0.56,
            knockoff: 0.49,
          },
          items: {
            sitrusberry: 0.59,
            safetygoggles: 0.21,
          },
          abilities: {
            intimidate: 1,
          },
          teraTypes: {
            grass: 0.37,
          },
          spreads: [
            {
              nature: "Careful",
              evs: [244, 4, 100, 0, 156, 4],
              percentage: 1,
            },
          ],
        },
        rillaboom: {
          name: "Rillaboom",
          usageRate: 0.095,
          teammates: {},
          moves: {
            fakeout: 0.79,
            grassyglide: 0.73,
            woodhammer: 0.51,
            uturn: 0.44,
          },
          items: {
            assaultvest: 0.58,
            miracleSeed: 0.18,
          },
          abilities: {
            grassysurge: 1,
          },
          teraTypes: {
            fire: 0.33,
          },
          spreads: [
            {
              nature: "Adamant",
              evs: [236, 252, 4, 0, 12, 4],
              percentage: 1,
            },
          ],
        },
        amoonguss: {
          name: "Amoonguss",
          usageRate: 0.091,
          teammates: {},
          moves: {
            ragepowder: 0.81,
            spore: 0.76,
            pollenpuff: 0.49,
            protect: 0.42,
          },
          items: {
            rockyhelmet: 0.47,
            sitrusberry: 0.22,
          },
          abilities: {
            regenerator: 1,
          },
          teraTypes: {
            water: 0.41,
          },
          spreads: [
            {
              nature: "Sassy",
              evs: [236, 0, 156, 0, 116, 0],
              percentage: 1,
            },
          ],
        },
        ogerponwellspring: {
          name: "Ogerpon-Wellspring",
          usageRate: 0.088,
          teammates: {},
          moves: {
            ivycudgel: 0.82,
            hornleech: 0.59,
            spikyshield: 0.54,
            followme: 0.28,
          },
          items: {
            wellspringmask: 1,
          },
          abilities: {
            waterabsorb: 1,
          },
          teraTypes: {
            water: 1,
          },
          spreads: [
            {
              nature: "Jolly",
              evs: [4, 252, 0, 0, 0, 252],
              percentage: 1,
            },
          ],
        },
      },
    };
  }

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
          moves: {
            tailwind: 0.92,
            moonblast: 0.61,
            encore: 0.58,
            helpinghand: 0.52,
          },
          items: {
            focussash: 0.8,
          },
          abilities: {
            prankster: 1,
          },
          teraTypes: {
            ghost: 0.55,
          },
          spreads: [
            {
              nature: "Timid",
              evs: [4, 0, 0, 252, 0, 252],
              percentage: 1,
            },
          ],
        },
        regidrago: {
          name: "Regidrago",
          usageRate: 0.038,
          teammates: {},
          moves: {
            dragonenergy: 0.89,
            dracometeor: 0.63,
            protect: 0.54,
            earthpower: 0.41,
          },
          items: {
            dragonsfang: 0.56,
            choicespecs: 0.24,
          },
          abilities: {
            dragonsmaw: 1,
          },
          teraTypes: {
            dragon: 0.74,
          },
          spreads: [
            {
              nature: "Timid",
              evs: [4, 0, 0, 252, 0, 252],
              percentage: 1,
            },
          ],
        },
        gholdengo: {
          name: "Gholdengo",
          usageRate: 0.034,
          teammates: {},
          moves: {
            makeitrain: 0.84,
            shadowball: 0.71,
            nastyplot: 0.43,
            protect: 0.41,
          },
          items: {
            lifeorb: 0.47,
            metalcoat: 0.2,
          },
          abilities: {
            goodasgold: 1,
          },
          teraTypes: {
            steel: 0.61,
          },
          spreads: [
            {
              nature: "Modest",
              evs: [4, 0, 0, 252, 0, 252],
              percentage: 1,
            },
          ],
        },
        ogerponcornerstone: {
          name: "Ogerpon-Cornerstone",
          usageRate: 0.033,
          teammates: {},
          moves: {
            ivycudgel: 0.85,
            hornleech: 0.71,
            spikyshield: 0.55,
            followme: 0.39,
          },
          items: {
            cornerstoneMask: 1,
          },
          abilities: {
            sturdy: 1,
          },
          teraTypes: {
            rock: 1,
          },
          spreads: [
            {
              nature: "Jolly",
              evs: [4, 252, 0, 0, 0, 252],
              percentage: 1,
            },
          ],
        },
        incineroar: {
          name: "Incineroar",
          usageRate: 0.03,
          teammates: {},
          moves: {
            fakeout: 0.87,
            partingshot: 0.8,
            flareblitz: 0.6,
            knockoff: 0.5,
          },
          items: {
            sitrusberry: 0.7,
          },
          abilities: {
            intimidate: 1,
          },
          teraTypes: {
            grass: 0.35,
          },
          spreads: [
            {
              nature: "Careful",
              evs: [244, 4, 100, 0, 156, 4],
              percentage: 1,
            },
          ],
        },
        amoonguss: {
          name: "Amoonguss",
          usageRate: 0.028,
          teammates: {},
          moves: {
            spore: 0.86,
            ragepowder: 0.74,
            pollenpuff: 0.59,
            protect: 0.43,
          },
          items: {
            rockyhelmet: 0.38,
            sitrusberry: 0.24,
          },
          abilities: {
            regenerator: 1,
          },
          teraTypes: {
            water: 0.42,
          },
          spreads: [
            {
              nature: "Calm",
              evs: [236, 0, 156, 0, 116, 0],
              percentage: 1,
            },
          ],
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
          moves: {
            trickroom: 0.9,
            lunarblessing: 0.62,
            icebeam: 0.46,
            helpinghand: 0.43,
          },
          items: {
            safetygoggles: 0.52,
            sitrusberry: 0.23,
          },
          abilities: {
            levitate: 1,
          },
          teraTypes: {
            fairy: 0.51,
          },
          spreads: [
            {
              nature: "Sassy",
              evs: [252, 0, 156, 0, 100, 0],
              percentage: 1,
            },
          ],
        },
        ursaluna: {
          name: "Ursaluna",
          usageRate: 0.038,
          teammates: {},
          moves: {
            facade: 0.84,
            headlongrush: 0.77,
            protect: 0.55,
            swordsdance: 0.31,
          },
          items: {
            flameorb: 0.92,
          },
          abilities: {
            guts: 1,
          },
          teraTypes: {
            normal: 0.81,
          },
          spreads: [
            {
              nature: "Brave",
              evs: [252, 252, 0, 0, 4, 0],
              percentage: 1,
            },
          ],
        },
        incineroar: {
          name: "Incineroar",
          usageRate: 0.034,
          teammates: {},
          moves: {
            fakeout: 0.87,
            partingshot: 0.8,
            flareblitz: 0.6,
            knockoff: 0.5,
          },
          items: {
            sitrusberry: 0.7,
          },
          abilities: {
            intimidate: 1,
          },
          teraTypes: {
            grass: 0.35,
          },
          spreads: [
            {
              nature: "Careful",
              evs: [244, 4, 100, 0, 156, 4],
              percentage: 1,
            },
          ],
        },
        amoonguss: {
          name: "Amoonguss",
          usageRate: 0.033,
          teammates: {},
          moves: {
            spore: 0.86,
            ragepowder: 0.74,
            pollenpuff: 0.59,
            protect: 0.43,
          },
          items: {
            rockyhelmet: 0.38,
            sitrusberry: 0.24,
          },
          abilities: {
            regenerator: 1,
          },
          teraTypes: {
            water: 0.42,
          },
          spreads: [
            {
              nature: "Calm",
              evs: [236, 0, 156, 0, 116, 0],
              percentage: 1,
            },
          ],
        },
        urshifurapidstrike: {
          name: "Urshifu-Rapid-Strike",
          usageRate: 0.03,
          teammates: {},
          moves: {
            surgingstrikes: 0.85,
            closecombat: 0.67,
            aquajet: 0.41,
            protect: 0.35,
          },
          items: {
            mysticwater: 0.44,
            choiceband: 0.21,
          },
          abilities: {
            unseenfist: 1,
          },
          teraTypes: {
            water: 0.69,
          },
          spreads: [
            {
              nature: "Jolly",
              evs: [4, 252, 0, 0, 0, 252],
              percentage: 1,
            },
          ],
        },
        fluttermane: {
          name: "Flutter Mane",
          usageRate: 0.029,
          teammates: {},
          moves: {
            moonblast: 0.88,
            shadowball: 0.78,
            icywind: 0.37,
            protect: 0.33,
          },
          items: {
            boosterenergy: 0.57,
            focussash: 0.23,
          },
          abilities: {
            protosynthesis: 1,
          },
          teraTypes: {
            fairy: 0.62,
          },
          spreads: [
            {
              nature: "Timid",
              evs: [4, 0, 0, 252, 0, 252],
              percentage: 1,
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
