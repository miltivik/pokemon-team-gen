/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const jiti = require("jiti")(__filename, {
  interopDefault: true,
  alias: {
    "@": rootDir,
    "@/": `${rootDir}${path.sep}`,
  },
});

const { FORMATS, getGenFromFormat } = jiti(path.join(rootDir, "config/formats.ts"));
const { sanitizeTemplateForFormat } = jiti(path.join(rootDir, "config/templates.ts"));
const { getCompetitiveFormatProfile } = jiti(
  path.join(rootDir, "lib/competitive-format-profile.ts")
);
const { generateDynamicTeam } = jiti(path.join(rootDir, "lib/dynamic-builder.ts"));
const { isAllowedInFormat } = jiti(path.join(rootDir, "lib/format-rules.ts"));
const { getCanonicalSpeciesId } = jiti(path.join(rootDir, "lib/pokemon-forms.ts"));
const { isLegendaryOrParadoxSpecies, isRestrictedLegendarySpecies, isMythicalSpecies } = jiti(
  path.join(rootDir, "lib/pokemon-classification.ts")
);
const { isAvailableInGen } = jiti(path.join(rootDir, "lib/showdown-data.ts"));

const DEFAULT_MONOTYPE = "water";

function assertHistoricalFormatRules() {
  for (const species of ["Naganadel", "Wobbuffet"]) {
    assert.equal(
      isAllowedInFormat(species, "gen8doublesou"),
      true,
      `${species} should remain valid in historical Gen 8 Doubles OU`
    );
  }

  assert.equal(
    isAllowedInFormat("Naganadel", "gen9doublesou"),
    false,
    "Naganadel should remain invalid in current Gen 9 Doubles OU"
  );
}

function parseArgs(argv) {
  const args = {
    iterations: 2,
    format: null,
    gen: null,
    templateId: "balanced",
    type: null,
    excludeLegendaries: false,
  };

  for (const token of argv) {
    if (token.startsWith("--iterations=")) {
      args.iterations = Math.max(1, Number(token.split("=")[1]) || args.iterations);
    } else if (token.startsWith("--format=")) {
      args.format = token.split("=")[1] || null;
    } else if (token.startsWith("--gen=")) {
      args.gen = Number(token.split("=")[1]) || null;
    } else if (token.startsWith("--template=")) {
      args.templateId = token.split("=")[1] || args.templateId;
    } else if (token.startsWith("--type=")) {
      args.type = token.split("=")[1] || null;
    } else if (token === "--exclude-legendaries") {
      args.excludeLegendaries = true;
    }
  }

  return args;
}

function getSelectedFormats(args) {
  let formats = Object.keys(FORMATS);

  if (args.format) {
    formats = formats.filter((format) => format === args.format);
  }

  if (args.gen) {
    formats = formats.filter((format) => getGenFromFormat(format) === args.gen);
  }

  return formats;
}

function toTypeName(type) {
  return String(type || "").toLowerCase();
}

function formatMember(member) {
  return `${member.name} (${(member.types || []).join("/")})`;
}

function collectTeamIssues(result, format, requestedType, excludeLegendaries) {
  const expectedTeamSize = FORMATS[format].maxTeamSize;
  const gen = getGenFromFormat(format);
  const enforceFormatRules = shouldEnforceFormatRules(format);
  const formatProfile = getCompetitiveFormatProfile(format);
  const canonicalIds = new Set();
  const issues = [];

  if (result.team.length !== expectedTeamSize) {
    issues.push(`team-size:${result.team.length}/${expectedTeamSize}`);
  }

  if (formatProfile.isVgc) {
    if (FORMATS[format].gameType !== "doubles") {
      issues.push("vgc-not-doubles");
    }
    const restrictedCount = result.team.filter((member) =>
      isRestrictedLegendarySpecies(member.name)
    ).length;
    if (
      formatProfile.maxRestrictedPokemon !== undefined &&
      restrictedCount > formatProfile.maxRestrictedPokemon
    ) {
      issues.push(`restricted-count:${restrictedCount}`);
    }
    const mythical = result.team.filter((member) => isMythicalSpecies(member.name));
    if (mythical.length > 0) {
      issues.push(`mythical-banned:${mythical.map((member) => member.name).join(",")}`);
    }
  }

  if (formatProfile.enforceItemClause) {
    const itemIds = result.team.map((member) => String(member.item || "").toLowerCase());
    const duplicateItems = itemIds.filter(
      (item, index) => itemIds.indexOf(item) !== index
    );
    if (duplicateItems.length > 0) {
      issues.push(`item-clause:${[...new Set(duplicateItems)].join(",")}`);
    }
  }

  for (const member of result.team) {
    const canonicalId = getCanonicalSpeciesId(member);
    if (canonicalIds.has(canonicalId)) {
      issues.push(`species-clause:${member.name}`);
    }
    canonicalIds.add(canonicalId);

    if (!isAvailableInGen(member.name, gen)) {
      issues.push(`generation-filter:${formatMember(member)}`);
    }

    if (enforceFormatRules && !isAllowedInFormat(member, format)) {
      issues.push(`format-rules:${formatMember(member)}`);
    }

    if (excludeLegendaries && isLegendaryOrParadoxSpecies(member.name)) {
      issues.push(`legendary-filter:${member.name}`);
    }

    if (requestedType) {
      const memberTypes = (member.types || []).map(toTypeName);
      if (!memberTypes.includes(toTypeName(requestedType))) {
        issues.push(`type-filter:${formatMember(member)}`);
      }
    }
  }

  return issues;
}

function shouldEnforceFormatRules(format) {
  const formatProfile = getCompetitiveFormatProfile(format);
  const gen = getGenFromFormat(format);
  const suffix = format.replace(/^gen\d+/, "").toLowerCase();

  return (
    gen === 9 ||
    formatProfile.isDoubles ||
    formatProfile.isVgc ||
    suffix === "lc" ||
    suffix === "monotype"
  );
}

async function runFormat(format, args) {
  const formatProfile = getCompetitiveFormatProfile(format);
  const safeTemplateId = sanitizeTemplateForFormat(args.templateId, format);
  const requestedType =
    args.type || (format.toLowerCase().includes("monotype") ? DEFAULT_MONOTYPE : undefined);
  const failureCounts = new Map();
  const samples = [];
  let passedRuns = 0;

  for (let index = 0; index < args.iterations; index += 1) {
    try {
      const result = await generateDynamicTeam({
        format,
        templateId: safeTemplateId,
        type: requestedType,
        excludeLegendaries: args.excludeLegendaries,
        lang: "en",
        rngSeed: `generation-matrix:${format}:${safeTemplateId}:${requestedType || "none"}:${index}`,
      });
      const issues = collectTeamIssues(
        result,
        format,
        requestedType,
        args.excludeLegendaries
      );

      if (issues.length === 0) {
        passedRuns += 1;
      } else {
        for (const issue of issues) {
          failureCounts.set(issue, (failureCounts.get(issue) || 0) + 1);
        }
      }

      samples.push({
        ok: issues.length === 0,
        issues,
        archetype: result.archetype,
        source: result.dataProvenance?.resolvedFormat || result.dataProvenance?.requestedFormat,
        members: result.team.map(formatMember),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failureCounts.set(`exception:${message}`, (failureCounts.get(`exception:${message}`) || 0) + 1);
      samples.push({
        ok: false,
        issues: [`exception:${message}`],
        archetype: "n/a",
        source: "n/a",
        members: [],
      });
    }
  }

  return {
    format,
    label: FORMATS[format].label,
    gen: getGenFromFormat(format),
    gameType: FORMATS[format].gameType,
    profile: formatProfile.id,
    templateId: safeTemplateId,
    requestedType,
    passedRuns,
    iterations: args.iterations,
    success: passedRuns === args.iterations,
    failureCounts: Array.from(failureCounts.entries()).sort((a, b) => b[1] - a[1]),
    samples,
  };
}

function printResult(result) {
  const status = result.success ? "PASS" : "FAIL";
  console.log(
    `\n[${status}] ${result.format} | ${result.label} | template=${result.templateId} | type=${result.requestedType || "none"} | ${result.passedRuns}/${result.iterations}`
  );

  const sample = result.samples[0];
  if (sample) {
    console.log(`  sample -> archetype=${sample.archetype || "n/a"} | source=${sample.source || "n/a"}`);
    if (sample.members.length > 0) {
      console.log(`  members -> ${sample.members.join(" | ")}`);
    }
  }

  if (result.failureCounts.length > 0) {
    console.log("  top failures:");
    for (const [failure, count] of result.failureCounts.slice(0, 6)) {
      console.log(`    - ${count}x ${failure}`);
    }
  }
}

async function main() {
  assertHistoricalFormatRules();
  const args = parseArgs(process.argv.slice(2));
  const formats = getSelectedFormats(args);

  if (formats.length === 0) {
    console.error("No generation matrix formats selected.");
    process.exit(1);
  }

  console.log("=========================================");
  console.log("      GENERATION FORMAT TEST MATRIX      ");
  console.log("=========================================");
  console.log(`Formats: ${formats.length} | Iterations per format: ${args.iterations}`);

  let hasFailures = false;
  for (const format of formats) {
    const result = await runFormat(format, args);
    printResult(result);
    if (!result.success) {
      hasFailures = true;
    }
  }

  console.log("\n=========================================");
  console.log(hasFailures ? "   GENERATION MATRIX FAILED" : "   GENERATION MATRIX PASSED");
  console.log("=========================================");

  if (hasFailures) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
