import { FORMATS, FormatId } from "../config/formats";
import { TemplateId } from "../config/templates";
import { generateDynamicTeam } from "../lib/dynamic-builder";

async function runTests() {
  console.log("=========================================");
  console.log("   POKEMON TEAM GENERATION TEST SUITE    ");
  console.log("=========================================\n");

  const tests: { format: FormatId; template: TemplateId; fixedMembers?: string[] }[] = [
    { format: "gen9ou", template: "balanced" },
    { format: "gen9ou", template: "offense" },
    { format: "gen9ou", template: "stall", fixedMembers: ["blissey", "skarmory"] },
    { format: "gen9vgc2026f", template: "balanced", fixedMembers: ["ogerpon"] },
    { format: "gen9vgc2026f", template: "trickroom" },
    { format: "gen9vgc2026f", template: "tailwind" },
    { format: "gen8ou", template: "balanced" },
  ];

  for (const test of tests) {
    console.log(
      `\n--- Testing Format: ${test.format} | Template: ${test.template} | Fixed: ${test.fixedMembers?.join(",") || "None"} ---`
    );

    try {
      console.time("Generation Time");
      const result = await generateDynamicTeam({
        format: test.format,
        templateId: test.template,
        fixedMembers: test.fixedMembers,
        lang: "en",
      });
      console.timeEnd("Generation Time");

      const resolvedFormat =
        result.dataProvenance &&
        "resolvedFormat" in result.dataProvenance &&
        result.dataProvenance.resolvedFormat
          ? result.dataProvenance.resolvedFormat
          : test.format;

      console.log(
        `Archetype: ${result.archetype || "n/a"} | Subarchetype: ${result.subarchetype || "n/a"}`
      );
      console.log(
        `Source: ${result.dataProvenance?.provider || "n/a"} -> ${resolvedFormat}`
      );

      console.log("\nTEAM GENERATED:");
      result.team.forEach((mon, index) => {
        console.log(
          `  ${index + 1}. ${mon.name.padEnd(16)} | Role: ${mon.role.padEnd(12)} | Tera: ${mon.teraType || "N/A"}`
        );
        console.log(`     Item: ${mon.item} | Ability: ${mon.ability}`);
        console.log(`     Moves: ${mon.moves.join(", ")}`);
        console.log(`     EVs: ${mon.evs}\n`);
      });

      if (result.recommendedModes && result.recommendedModes.length > 0) {
        console.log("Recommended Modes:");
        result.recommendedModes.forEach((mode) => {
          console.log(`  - ${mode.title}: ${mode.members.join(", ")}`);
        });
      }

      const expectedTeamSize = FORMATS[test.format].maxTeamSize;
      if (result.team.length !== expectedTeamSize) {
        console.warn(
          `WARNING: Team generated with ${result.team.length} members instead of ${expectedTeamSize}.`
        );
      }
    } catch (error) {
      console.error(`ERROR generating team for ${test.format}:`, error);
    }
  }

  console.log("\n=========================================");
  console.log("              TEST SUITE DONE            ");
  console.log("=========================================");
}

runTests();
