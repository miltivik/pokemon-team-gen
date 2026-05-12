import type { TemplateId } from "@/config/templates";

export interface ArchetypeStrategy {
  overview: string;
  earlyGame: string;
  midGame: string;
  lateGame: string;
  coreExplanation: string;
}

const STRATEGIES: Record<TemplateId, ArchetypeStrategy> = {
  balanced: {
    overview:
      "Balanced teams are the bread and butter of competitive Pokemon. They combine offensive threats with defensive pivots to create a flexible gameplan that can adapt to most matchups. The goal is to maintain steady pressure while preserving a solid defensive backbone that can check the opponent's key threats.",
    earlyGame:
      "In the early game, focus on scouting your opponent's team and establishing entry hazards. Use your defensive pivots to gain information about items, abilities, and movesets. Avoid overcommitting your win condition until you know what checks it.",
    midGame:
      "During the mid game, leverage your balanced core to wear down the opponent's checks. Use pivot moves to maintain momentum and apply gradual pressure. Your tank should absorb hits and threaten back, forcing the opponent into uncomfortable trades.",
    lateGame:
      "In the late game, identify which of your sweepers has the clearest path to victory. Once the opponent's primary checks are weakened or removed, set up with your win condition and close out the match. Preserve your speed control for the final push.",
    coreExplanation:
      "A balanced core requires at least one reliable physical wall, one special wall (or a mixed tank), a pivot, and a win condition. Hazard control — both setting Stealth Rock and having Defog or Rapid Spin — is essential for long-term pressure.",
  },
  offense: {
    overview:
      "Hyper Offense (HO) teams aim to overwhelm the opponent before they can stabilize. By stacking multiple setup sweepers and lead pressure, HO seeks to break through defensive cores through sheer force. Games are often decided within the first 15-20 turns.",
    earlyGame:
      "Lead with your hazard setter or suicide lead to stack Stealth Rock, Spikes, or Sticky Web. Apply immediate pressure so the opponent cannot comfortably switch in their defensive answers. Sacrifice momentum only to remove critical walls.",
    midGame:
      "Bring in your sweepers once hazards are up. Use setup moves like Dragon Dance, Swords Dance, or Nasty Plot on forced switches. Your priority should be removing the opponent's one or two defensive checks before they can heal or pivot out.",
    lateGame:
      "By the late game, the opponent's team should be chipped enough for a clean sweep. Use your fastest or strongest remaining threat to close out. If you still have a suicide lead available, use it to block Defog or Rapid Spin attempts.",
    coreExplanation:
      "Hyper Offense cores need multiple setup sweepers with different coverage types, a dedicated lead for hazards, and often a Choice Scarf user to revenge kill. Anti-hazard measures are less important than on balanced teams because games end quickly.",
  },
  bulkyoffense: {
    overview:
      "Bulky Offense combines the raw power of offensive teams with enough bulk to take hits and trade effectively. These teams rely on tanky sweepers and pivots that can dish out damage while surviving neutral or resisted hits, making them more consistent than pure Hyper Offense.",
    earlyGame:
      "Start by establishing board control with your most durable pivot. Bulky Offense can afford to trade early because its Pokemon aren't easily OHKOed. Use Knock Off and U-turn to gather information and remove items.",
    midGame:
      "Use your tanks to wallbreak and force switches. Because your sweepers have bulk, they can setup in situations where frailer Pokemon would be forced out. Apply pressure on both sides of the spectrum to stretch the opponent's defensive core.",
    lateGame:
      "In the late game, your remaining bulky threats should outlast the opponent's worn-down checks. Use recovery or pivoting to preserve health while maintaining offensive pressure. Your win condition likely has enough bulk to setup on weakened attacks.",
    coreExplanation:
      "A Bulky Offense core needs tanky attackers with recovery or Regenerator, a strong wallbreaker, and hazard support. The key is having sweepers that can take a hit while boosting or attacking, unlike the glass cannons of pure HO.",
  },
  voltturn: {
    overview:
      "Volt-Turn teams abuse pivot moves like Volt Switch, U-turn, and Flip Turn to maintain relentless offensive pressure. By constantly switching while dealing damage, these teams wear down the opponent's team through attrition and force predictable switches that can be exploited.",
    earlyGame:
      "Begin by scouting with fast pivot users. The goal is to identify the opponent's defensive answers and gradually wear them down. Entry hazards are valuable because they punish the constant switching that Volt-Turn forces.",
    midGame:
      "Chain pivots together to keep momentum. If the opponent switches in a ground type to block Volt Switch, punish with U-turn or a coverage move. Use Knock Off liberally to strip Leftovers and Rocky Helmets from walls.",
    lateGame:
      "By the late game, the opponent's walls should be too weak to stop your breakers. Use your strongest pivot or wallbreaker to clean up. If you have a Choice Scarf user, preserve it to outspeed and revenge kill any remaining threats.",
    coreExplanation:
      "A Volt-Turn core requires multiple Pokemon with pivoting moves and Regenerator or good bulk. You need at least one Electric-type pivot, one Bug-type pivot, and a strong breaker that benefits from the momentum gained.",
  },
  trickroom: {
    overview:
      "Trick Room teams flip the traditional speed hierarchy by making slower Pokemon move first for five turns. This allows incredibly powerful but slow threats to dominate. The archetype is inherently high-risk, high-reward because it relies on successfully setting Trick Room.",
    earlyGame:
      "Your first goal is to set Trick Room safely. Lead with your Trick Room setter, often protected by Fake Out, Follow Me, or redirection. If the opponent has a fast Taunt user, scout carefully or lead with a different Pokemon to absorb it.",
    midGame:
      "Once Trick Room is active, bring in your slow breakers immediately. Use Protect to stall out turns of opposing Tailwind or weather. Focus on removing the opponent's Dark-type threats that can ignore Prankster Trick Room.",
    lateGame:
      "In the late game, try to reset Trick Room if it expired. Your remaining slow threats should still have the bulk to take hits even without Trick Room. If you cannot reset, play defensively and rely on your natural bulk to outlast faster threats.",
    coreExplanation:
      "Trick Room cores need a reliable setter (often with Prankster, Mental Herb, or Redirection support) and multiple slow, hard-hitting sweepers. Protect is nearly mandatory on every member to safely navigate the five-turn window.",
  },
  tailwind: {
    overview:
      "Tailwind teams double the Speed of all allied Pokemon for four turns, enabling otherwise slow but powerful threats to outspeed and dominate. This archetype is almost exclusive to doubles formats like VGC, where positioning and speed control are paramount.",
    earlyGame:
      "Lead with your Tailwind setter paired with a Fake Out or redirection user to guarantee the setup. Protect your setter from Taunt and opposing speed control like Icy Wind. Getting Tailwind up turn one is usually the win condition.",
    midGame:
      "Abuse the speed boost to pick off threats before they can move. Use spread moves and strong single-target attacks to pressure both opponents. Keep your setter alive if possible to reset Tailwind when it expires.",
    lateGame:
      "If Tailwind expires, reassess the board. If you still have a fast threat remaining, you may not need to reset. Otherwise, use your last Pokemon with speed-boosting options or priority to clean up.",
    coreExplanation:
      "Tailwind cores require a fast or Prankster setter, speed-boosted sweepers with spread coverage, and Fake Out or redirection support. Protect is essential on almost every member to safely set up and stall opposing speed control.",
  },
  rain: {
    overview:
      "Rain teams summon permanent rain via Drizzle to empower Water-type attacks, enable Swift Swim sweepers, and guarantee perfect accuracy on moves like Thunder and Hurricane. The archetype is notoriously explosive and can dismantle unprepared teams within a few turns.",
    earlyGame:
      "Lead with your Drizzle setter (typically Pelipper) and immediately start building momentum. Use U-turn or Flip Turn to bring in your Swift Swim sweepers safely. Establish entry hazards if your setter carries them.",
    midGame:
      "Use your Swift Swim sweepers to break through walls. Barraskewda, Kingdra, and similar threats double their Speed and fire off devastating Water-type attacks. Keep rain active by preventing the opponent from switching in their own weather setter.",
    lateGame:
      "In the late game, your fastest remaining Swift Swim user should clean up. If rain has expired, you may still have naturally fast threats or priority to finish the job. Preserve your Drizzle setter if the opponent can change the weather.",
    coreExplanation:
      "Rain cores absolutely require a Drizzle user and at least one Swift Swim sweeper. A secondary rain abuser, Electric-type coverage for Water-resistant foes, and hazard support turn a good rain team into a great one.",
  },
  sun: {
    overview:
      "Sun teams use Drought to summon harsh sunlight, boosting Fire-type moves, enabling Chlorophyll sweepers, and powering up abilities like Solar Power and Protosynthesis. Sun is one of the most offensively potent weather archetypes in the game.",
    earlyGame:
      "Lead with your Drought setter and establish sun immediately. If the opponent has a weather setter of their own, try to keep yours healthy so you can reset sun if it gets overwritten. Use fast Chlorophyll users to apply pressure.",
    midGame:
      "Use your Fire-type and Grass-type sweepers to overwhelm the opponent's Water-type checks. Solar Power users can nuke almost anything with a single attack, but require careful pivoting due to recoil. Spread damage aggressively.",
    lateGame:
      "By the late game, the opponent's Fire-resistant Pokemon should be weakened. Use your fastest Chlorophyll sweeper or strongest Fire-type to close out. If sun is down, rely on your team's natural speed tiers or priority.",
    coreExplanation:
      "Sun cores need a Drought setter, at least one Chlorophyll or Protosynthesis sweeper, and a Fire-type wallbreaker. Answers to opposing Water-types and weather changers are essential for consistency.",
  },
  sand: {
    overview:
      "Sand teams use Sand Stream to summon a sandstorm that chips non-Rock, Steel, and Ground types while enabling Sand Rush and Sand Force sweepers. The archetype is historically one of the most consistent offensive playstyles thanks to its passive damage and strong abusers.",
    earlyGame:
      "Lead with your Sand Stream setter to start chipping the opponent's team. Use the passive damage to punish switches and wear down opponents that lack Leftovers or recovery. Set Stealth Rock early to compound the chip damage.",
    midGame:
      "Bring in your Sand Rush sweeper once the opponent's Ground-type check is weakened. Excadrill is the classic example, outspeeding the entire unboosted metagame under sand. Use your wallbreakers to remove shared checks.",
    lateGame:
      "In the late game, sand chip combined with Stealth Rock often puts opponents in range of your sweepers' attacks. Use your fastest remaining threat to clean up. If sand expires, reset it with your setter if still alive.",
    coreExplanation:
      "Sand cores require a Sand Stream setter and at least one Sand Rush or Sand Force abuser. Hazard stacking is especially effective here because sand chip + Stealth Rock wears down teams incredibly fast.",
  },
  weatheroffense: {
    overview:
      "Weather Offense is a flexible archetype that uses any permanent weather — rain, sun, sand, or snow — to power up its team. Unlike dedicated rain or sun teams, Weather Offense may mix different weather abusers or use a dual-weather core to keep the opponent guessing.",
    earlyGame:
      "Lead with your weather setter and establish your chosen condition immediately. Scout the opponent's team for opposing weather setters or auto-weather abilities. If they have one, plan to preserve your setter for a potential weather war.",
    midGame:
      "Use your weather-boosted sweepers to break through the opponent's defenses. Because Weather Offense can blend multiple abuser types, the opponent may struggle to find a single check that handles all your threats.",
    lateGame:
      "By the late game, weather chip and boosted attacks should have put the opponent in range for a clean sweep. Reset weather if necessary, or rely on your team's natural speed and power if the weather condition is no longer active.",
    coreExplanation:
      "Weather Offense cores need a reliable weather setter and at least two abusers that benefit from the condition. Having a backup plan for when weather is removed — such as a strong neutral attacker — prevents auto-losses to weather changers.",
  },
  hazardstack: {
    overview:
      "Hazard Stack teams aim to overload the opponent's side of the field with entry hazards and prevent their removal. By combining Stealth Rock, Spikes, Toxic Spikes, and Sticky Web, these teams punish every switch and slowly strangle defensive teams.",
    earlyGame:
      "Lead with your fastest hazard setter and stack as many layers as possible. Use Taunt to prevent the opponent from setting their own hazards or using Defog. If you have a Ghost-type, preserve it to block Rapid Spin.",
    midGame:
      "Force switches with strong attacks and pivot moves. Every time the opponent switches, they lose massive HP to hazards. Use Knock Off to remove Heavy-Duty Boots, ensuring hazards deal full damage to the entire team.",
    lateGame:
      "In the late game, defensive teams should be unable to heal fast enough to outpace hazard chip. Use your strongest wallbreaker to finish off weakened targets. If the opponent still has a Defog user, eliminate it at all costs.",
    coreExplanation:
      "Hazard Stack cores need multiple hazard setters, a spinblocker (Ghost-type), and Knock Off users to strip boots. A strong wallbreaker that benefits from hazard chip is the perfect complement to this strategy.",
  },
  semistall: {
    overview:
      "Semi-Stall blends the defensive resilience of stall with the ability to win through a single powerful win condition. Unlike pure stall, Semi-Stall doesn't aim to PP stall the entire opponent's team; instead, it outlasts threats and then sweeps with a setup Pokemon.",
    earlyGame:
      "Focus on scouting the opponent's team and identifying their win condition. Use your walls to absorb attacks and wear down the opponent through status and hazards. Avoid letting your win condition take unnecessary damage.",
    midGame:
      "Use your defensive core to exhaust the opponent's offensive resources. Apply Toxic or Will-O-Wisp to physical attackers. Once the opponent's primary checks to your win condition are weakened, begin setting up.",
    lateGame:
      "Bring in your win condition and set up safely behind a Substitute or after a KO. With the opponent's team worn down, a single Calm Mind, Swords Dance, or Dragon Dance should be enough to sweep.",
    coreExplanation:
      "Semi-Stall cores need multiple walls with recovery, a reliable win condition with setup, and hazard control. The win condition must have enough bulk to survive common priority moves after a boost.",
  },
  stall: {
    overview:
      "Stall is the ultimate defensive archetype, aiming to win through attrition, status, and passive damage. These teams have no traditional sweepers; instead, they rely on walls with recovery, entry hazards, and Toxic to outlast every threat the opponent brings.",
    earlyGame:
      "Identify the opponent's wallbreakers immediately. Use your walls to scout movesets and items. Set up Stealth Rock and Spikes as soon as possible. Preserve your cleric for when status becomes a problem.",
    midGame:
      "Apply Toxic to every Pokemon that isn't Steel or Poison type. Use your walls to endlessly cycle and heal while the opponent's health drains. Knock Off is crucial to remove items that could prolong the game.",
    lateGame:
      "By the late game, the opponent should be unable to break through your remaining walls. Use your most durable Pokemon to stall out the last few turns. If you have a win condition like Calm Mind Clefable, set up once all checks are gone.",
    coreExplanation:
      "Stall cores require at least two physical walls, two special walls, a cleric with Heal Bell or Aromatherapy, and a dedicated hazard setter. Unaware users are invaluable against setup sweepers.",
  },
  random: {
    overview:
      "Random teams have no predefined archetype. They are useful for casual play, team exploration, or when you want to experiment with unconventional combinations. While less consistent than structured archetypes, random teams can surprise opponents.",
    earlyGame:
      "Because your team lacks a unified strategy, focus on playing to each Pokemon's individual strengths. Scout aggressively and look for opportunities where your random assortment of types and moves catches the opponent off guard.",
    midGame:
      "Identify which of your Pokemon has the best matchup against the opponent's remaining team. Use pivot moves to bring your best answers in safely. Don't be afraid to sacrifice a Pokemon if it opens a path for another.",
    lateGame:
      "In the late game, your strongest or healthiest remaining Pokemon will likely decide the match. Preserve any Choice Scarf or priority user for cleaning up weakened threats.",
    coreExplanation:
      "Random teams have no strict core requirements. Focus on having at least one physical attacker, one special attacker, and one Pokemon with hazard control to cover basic competitive needs.",
  },
};

export function getArchetypeStrategy(templateId: TemplateId): ArchetypeStrategy | null {
  return STRATEGIES[templateId] ?? null;
}
