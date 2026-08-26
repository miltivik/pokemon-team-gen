import type { Metadata } from "next";

export interface TeamBuilderLandingStep {
  title: string;
  description: string;
}

export interface TeamBuilderLandingFaq {
  question: string;
  answer: string;
}

export interface TeamBuilderLanding {
  pathname: string;
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  intro: string;
  formatLabel: string;
  builderHref: string;
  builderCta: string;
  guideHref: string;
  guideLabel: string;
  steps: readonly TeamBuilderLandingStep[];
  useCases: readonly TeamBuilderLandingStep[];
  faqs: readonly TeamBuilderLandingFaq[];
  featuredPokemon: readonly string[];
}

export interface TeamBuilderLandingLink {
  pathname: string;
  label: string;
  description: string;
}

export const TEAM_BUILDER_LANDING_LINKS: readonly TeamBuilderLandingLink[] = [
  {
    pathname: "/pokemon-showdown-team-builder",
    label: "Pokemon Showdown Team Builder",
    description: "The general builder for legal teams, formats and export-ready Showdown text.",
  },
  {
    pathname: "/gen-9-ou-team-builder",
    label: "Gen 9 OU Team Builder",
    description: "Build a singles team around current OU roles, threats and archetypes.",
  },
  {
    pathname: "/vgc-team-builder",
    label: "VGC Team Builder",
    description: "Prepare a Regulation I doubles team with speed control and legal restricted slots.",
  },
  {
    pathname: "/rain-team-builder",
    label: "Rain Team Builder",
    description: "Start a weather core with Drizzle, Swift Swim pressure and hazard support.",
  },
  {
    pathname: "/hyper-offense-team-builder",
    label: "Hyper Offense Team Builder",
    description: "Generate an aggressive team with hazards, setup and immediate pressure.",
  },
];

export const TEAM_BUILDER_LANDINGS: Record<string, TeamBuilderLanding> = {
  gen9Ou: {
    pathname: "/gen-9-ou-team-builder",
    title: "Gen 9 OU Team Builder | Pokemon Showdown",
    description:
      "Build a legal Gen 9 OU team for Pokemon Showdown with current format rules, proven archetypes, threat coverage and a ready-to-export roster for ladder testing.",
    h1: "Gen 9 OU Team Builder",
    eyebrow: "Competitive singles for Pokemon Showdown",
    intro:
      "Build a legal Gen 9 OU team with a clear win condition, hazard plan, speed control and competitive sets you can export to Pokemon Showdown immediately.",
    formatLabel: "[Gen 9] OU",
    builderHref: "/configurar?format=gen9ou",
    builderCta: "Build a Gen 9 OU team",
    guideHref: "/guides/gen9-ou",
    guideLabel: "Read the Gen 9 OU guide",
    steps: [
      {
        title: "Choose a win condition",
        description: "Start with a sweeper, breaker or defensive core that gives the six a concrete way to win.",
      },
      {
        title: "Cover the OU threats",
        description: "Add hazard control, speed answers and defensive checks before committing to a final moveset.",
      },
      {
        title: "Export and test",
        description: "Generate the roster, review the format legality and copy the Showdown text for ladder testing.",
      },
    ],
    useCases: [
      {
        title: "Balance and bulky offense",
        description: "Combine durable pivots with a win condition that can make progress throughout a long game.",
      },
      {
        title: "Hazard pressure",
        description: "Use Stealth Rock, Spikes and Ghost pressure to make every switch costly for the opponent.",
      },
      {
        title: "Team-building practice",
        description: "Start from a known archetype, then adjust roles and Pokemon after testing the first export.",
      },
    ],
    faqs: [
      {
        question: "What is a Gen 9 OU team builder?",
        answer: "It generates a six-Pokemon singles team for the current Gen 9 OU ruleset, including compatible roles, sets and an export format for Pokemon Showdown.",
      },
      {
        question: "Can I choose an archetype?",
        answer: "Yes. You can start from Balanced, Hyper Offense, Rain, Stall and other compatible team styles before generating the roster.",
      },
      {
        question: "How do I use the generated team?",
        answer: "Open the export action, copy the Showdown text and paste it into the Pokemon Showdown Teambuilder for testing.",
      },
    ],
    featuredPokemon: ["Great Tusk", "Kingambit", "Gholdengo", "Gliscor", "Dragapult", "Zamazenta"],
  },
  vgc: {
    pathname: "/vgc-team-builder",
    title: "VGC Team Builder | Pokemon Showdown",
    description:
      "Build a legal VGC 2026 Reg I team for Pokemon Showdown with restricted Pokemon, doubles roles, speed control and an export-ready roster for tournament practice.",
    h1: "VGC Team Builder",
    eyebrow: "Doubles team building for Pokemon Showdown",
    intro:
      "Prepare a VGC 2026 Regulation I team for Pokemon Showdown with legal restricted slots, speed control, protect patterns and complementary doubles roles.",
    formatLabel: "[Gen 9] VGC 2026 Reg I",
    builderHref: "/configurar?format=gen9vgc2026regi",
    builderCta: "Build a VGC team",
    guideHref: "/guides/vgc",
    guideLabel: "Read the VGC guide",
    steps: [
      {
        title: "Pick the doubles plan",
        description: "Choose a playstyle such as Tailwind, Trick Room, weather or direct offensive pressure.",
      },
      {
        title: "Pair the roles",
        description: "Combine restricted attackers, support, speed control and Protect users that function together on the field.",
      },
      {
        title: "Check Regulation I legality",
        description: "Review the two-restricted limit, unique items and other format rules before exporting the team.",
      },
    ],
    useCases: [
      {
        title: "Tailwind offense",
        description: "Create an early speed advantage and use spread attacks or focused double targets to close games.",
      },
      {
        title: "Trick Room",
        description: "Support slow, powerful attackers with reliable setters, redirection and positioning tools.",
      },
      {
        title: "Weather cores",
        description: "Build around sun or rain while keeping answers for opposing weather, speed control and priority.",
      },
    ],
    faqs: [
      {
        question: "Which VGC format does this page target?",
        answer: "This page targets VGC 2026 Regulation I on Pokemon Showdown, not Pokemon Champions regulations or a legacy Regulation F ladder.",
      },
      {
        question: "Can the builder use restricted Pokemon?",
        answer: "Yes. The Regulation I generator can use up to two restricted legendary Pokemon while applying the format's legality rules.",
      },
      {
        question: "Does the output work in Pokemon Showdown?",
        answer: "Yes. The generated team is formatted for Pokemon Showdown and can be copied into its Teambuilder after generation.",
      },
    ],
    featuredPokemon: ["Flutter Mane", "Miraidon", "Koraidon", "Incineroar", "Amoonguss", "Tornadus"],
  },
  rain: {
    pathname: "/rain-team-builder",
    title: "Rain Team Builder | Gen 9 OU Pokemon",
    description:
      "Build a Rain team for Gen 9 OU Pokemon Showdown with weather setters, Swift Swim pressure, hazard control and a legal roster ready to export and test.",
    h1: "Rain Team Builder",
    eyebrow: "Weather offense for Gen 9 OU",
    intro:
      "Build a Rain team that turns weather turns into offensive momentum through Water pressure, speed control, hazard support and carefully chosen pivots.",
    formatLabel: "[Gen 9] OU Rain",
    builderHref: "/configurar?template=rain&format=gen9ou",
    builderCta: "Build a Rain team",
    guideHref: "/teams/rain",
    guideLabel: "Read the Rain team guide",
    steps: [
      {
        title: "Set the weather plan",
        description: "Start with a reliable rain setter and decide how many turns your attackers need to make progress.",
      },
      {
        title: "Add pressure and control",
        description: "Pair Water damage with speed, hazards, pivoting and answers to Grass, Electric and opposing weather teams.",
      },
      {
        title: "Test the weather turns",
        description: "Export the team, track when rain is active and refine the roster around the matchups that stop the first plan.",
      },
    ],
    useCases: [
      {
        title: "Swift Swim pressure",
        description: "Use doubled Speed and boosted Water attacks to force the opponent to defend every rain turn.",
      },
      {
        title: "Pivot-based offense",
        description: "Keep momentum with switches and U-turn-style moves so the weather abusers enter safely.",
      },
      {
        title: "Weather matchups",
        description: "Build a secondary plan for sun, sand, bulky Water-types and teams that deny free setup turns.",
      },
    ],
    faqs: [
      {
        question: "Is this Rain builder for Gen 9 OU?",
        answer: "Yes. The preset opens the Gen 9 OU Rain archetype and keeps the generated roster aligned with the selected Showdown format.",
      },
      {
        question: "What makes a Rain team work?",
        answer: "A useful Rain team balances weather turns, Water pressure, speed control, hazard management and answers for Grass or opposing weather teams.",
      },
      {
        question: "Can I change the generated Rain team?",
        answer: "Yes. Export the first roster, test it and return to the configuration page to change the format, style or fixed Pokemon.",
      },
    ],
    featuredPokemon: ["Pelipper", "Barraskewda", "Rillaboom", "Ogerpon-Wellspring", "Great Tusk", "Kingambit"],
  },
  hyperOffense: {
    pathname: "/hyper-offense-team-builder",
    title: "Hyper Offense Team Builder | Gen 9 OU",
    description:
      "Build a Hyper Offense team for Gen 9 OU Pokemon Showdown with hazards, setup sweepers, speed control and a legal roster ready to export and test on the ladder.",
    h1: "Hyper Offense Team Builder",
    eyebrow: "Fast pressure for Gen 9 OU",
    intro:
      "Build a Hyper Offense team around hazards, setup windows, immediate damage and enough speed control to keep the opponent from stabilizing.",
    formatLabel: "[Gen 9] OU Hyper Offense",
    builderHref: "/configurar?template=offense&format=gen9ou",
    builderCta: "Build a Hyper Offense team",
    guideHref: "/teams/offense",
    guideLabel: "Read the Hyper Offense guide",
    steps: [
      {
        title: "Choose the endgame",
        description: "Start with a setup sweeper or fast breaker that benefits from early hazards and forced switches.",
      },
      {
        title: "Create setup windows",
        description: "Use screens, hazard pressure, disruption and offensive pivots to deny safe defensive turns.",
      },
      {
        title: "Keep the tempo",
        description: "Export the roster, test the opening sequence and replace slots that give common threats too much freedom.",
      },
    ],
    useCases: [
      {
        title: "Hazard stacking",
        description: "Turn every forced switch into progress and make priority or setup threats harder to answer later.",
      },
      {
        title: "Setup chains",
        description: "Combine multiple win conditions so the opponent cannot cover every boost or offensive angle at once.",
      },
      {
        title: "Lead experimentation",
        description: "Test different leads and opening turns while keeping the final six legal for the chosen format.",
      },
    ],
    faqs: [
      {
        question: "What is a Hyper Offense team?",
        answer: "Hyper Offense uses constant offensive pressure, hazards, disruption and setup threats instead of relying on long defensive exchanges.",
      },
      {
        question: "Can I use this preset for Gen 9 OU?",
        answer: "Yes. The preset selects the Gen 9 OU format and the compatible Hyper Offense archetype before you generate a team.",
      },
      {
        question: "Is the team ready for Pokemon Showdown?",
        answer: "The generator returns a legal Showdown-formatted roster that you can copy, test and refine after reviewing the first battle plan.",
      },
    ],
    featuredPokemon: ["Gholdengo", "Dragapult", "Roaring Moon", "Iron Valiant", "Kingambit", "Glimmora"],
  },
};

export function getTeamBuilderLanding(pathname: string): TeamBuilderLanding {
  const landing = Object.values(TEAM_BUILDER_LANDINGS).find((entry) => entry.pathname === pathname);
  if (!landing) {
    throw new Error(`Unknown team-builder landing: ${pathname}`);
  }

  return landing;
}

export function getTeamBuilderLandingMetadata(landing: TeamBuilderLanding): Metadata {
  return {
    title: landing.title,
    description: landing.description,
    keywords: [
      landing.title.replace(" | Pokemon Showdown", "").toLowerCase(),
      "pokemon team builder",
      "pokemon showdown",
      landing.formatLabel.toLowerCase(),
    ],
    alternates: {
      canonical: landing.pathname,
    },
    openGraph: {
      title: landing.title,
      description: landing.description,
      url: landing.pathname,
      type: "website",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: landing.title,
      description: landing.description,
      images: ["/og-image.png"],
    },
  };
}
