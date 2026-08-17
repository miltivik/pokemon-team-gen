/**
 * Hand-curated competitive insights for the most meta-relevant Pokemon.
 *
 * Rendered on /pokemon/[name] profiles: the summary replaces the templated
 * overview paragraph, and whenToUse/watchOut render as a "How to Use"
 * section. Entries are keyed by Smogon display name — only add Pokemon
 * that exist in data/gen9-sets.json so the rest of the page also has data.
 *
 * Keep guidance evergreen (roles, set archetypes, counterplay) rather than
 * time-sensitive meta claims.
 */
export interface CuratedPokemonInsight {
  /** 2-3 sentences: role, strengths, why it matters in competitive play. */
  summary: string;
  /** Practical guidance: when to pick it, how each set archytype is used. */
  whenToUse: string[];
  /** What beats it and how it fails — helps users build around it. */
  watchOut: string;
}

export const CURATED_POKEMON: Record<string, CuratedPokemonInsight> = {
  "Great Tusk": {
    summary:
      "Great Tusk is the premier entry-hazard controller of Gen 9 OU, compressing Rapid Spin, Stealth Rock and a physically defensive backbone into a single slot. Its Ground/Fighting STAB combination threatens Kingambit, Gholdengo and Heatran while Protosynthesis-boosted sets let it choose between extra speed or staying power.",
    whenToUse: [
      "On balance and bulky offense teams that need hazard removal and a Kingambit answer in one team slot.",
      "With Booster Energy Speed to revenge kill weakened threats, or a defensive spread with Leftovers to wall physical attackers all game.",
      "As an early-game lead that sets Stealth Rock and pressures common switch-ins like Corviknight with Close Combat.",
    ],
    watchOut:
      "Bulky Water-types such as Dondozo and Slowking-Galar wall its STAB combination, and faster special attackers exploit its weaker special side. Fairy- and Ice-type coverage also punishes it on the switch.",
  },
  Kingambit: {
    summary:
      "Kingambit is the defining late-game win condition of Gen 9 OU: Supreme Overlord grants it a stacking attack boost for every fallen teammate, turning a healthy Kingambit into an almost unstoppable closer. Sucker Punch gives it priority over faster revenge killers, and Swords Dance amplifies its snowball potential.",
    whenToUse: [
      "On teams that plan to trade resources early and win with a boosted Kingambit sweep in the endgame.",
      "With Swords Dance sets (Tera Dark or Tera Flying) to break through would-be counters after a boost.",
      "As a choice-band style wallbreaker with Black Glasses and four attacks when you need immediate power instead of setup.",
    ],
    watchOut:
      "Fighting-types like Great Tusk and Zamazenta revenge kill it easily, and burn cripples its attack. Dondozo's Unaware ignores its Supreme Overlord and Swords Dance boosts entirely.",
  },
  Gholdengo: {
    summary:
      "Gholdengo is the best hazard-stack enabler in Gen 9 OU thanks to Good as Gold, which makes it immune to status moves — including the Defog that would clear its teammates' hazards. A blazing 133 Special Attack and Make It Rain let it punish passive play, running everything from Choice Specs to Nasty Plot sweepers.",
    whenToUse: [
      "On hazard-stacking teams where blocking Defog and Rapid Spin support (as a Ghost) compounds chip damage.",
      "With Air Balloon to scout Ground attacks, or Choice Specs for immediate breaking power against balance cores.",
      "As a Nasty Plot win condition that uses Recover to outlast special answers.",
    ],
    watchOut:
      "Strong Ground-types such as Great Tusk and Landorus-Therian threaten it with Ground STAB, and Knock Off strips its item. Dark-type coverage from Kingambit and Ting-Lu also punishes switch-ins.",
  },
  Dragapult: {
    summary:
      "Dragapult's blistering 142 base Speed makes it the tier's premier offensive pivot, able to run physical, special or hex-based support sets with almost no tell. Its unpredictability forces opponents to guess wrong repeatedly, and Terastallization lets it flip its weaknesses mid-game.",
    whenToUse: [
      "With Hex + Will-O-Wisp sets to spread burn and punish defensive switches with doubled Hex damage.",
      "As a Choice Specs or mixed attacker that grabs momentum with U-turn against incoming special walls.",
      "On hyper offense as a Dragapult Tera Fairy setup cleaner that outspeeds the entire unboosted tier.",
    ],
    watchOut:
      "Kingambit's Sucker Punch bypasses its Speed tier, and Blissey blanks special sets. Booster Energy Iron Valiant outspeeds and knocks it out before it moves.",
  },
  Zamazenta: {
    summary:
      "Zamazenta is an elite physical wall and win condition in one: Dauntless Shield grants a free Defense boost on every entry, and Iron Defense + Body Press turns that bulk into devastating Fighting-type damage. Its speed tier also lets it check offensive threats like Kingambit and Weavile reliably.",
    whenToUse: [
      "As a defensive answer to Kingambit, Great Tusk and Iron Boulder that eventually wins with boosted Body Press.",
      "With Rest + Chesto Berry to shake off status and recover through long games.",
      "On balance teams that need a fast, self-sufficient win condition that doesn't require Tera investment.",
    ],
    watchOut:
      "Ghost-types are immune to Body Press, and Dondozo's Unaware ignores its Defense boosts. Special attackers with Ghost or Fairy coverage exploit its weaker special side.",
  },
  Gliscor: {
    summary:
      "Gliscor pairs Poison Heal with a Toxic Orb for free, passive recovery that makes it the tier's most durable hazard setter and status spreader. It stacks Spikes, absorbs Knock Off aimed at teammates and can spiral out of control with Swords Dance + Facade once poisoned.",
    whenToUse: [
      "As a Spikes-stacking defensive pivot that heals 1/8 of its HP every turn while chipping the opponent.",
      "With Swords Dance + Facade on bulkier offense, where its immunity to burn and poison makes it hard to wall.",
      "As a Knock Off absorber — losing its Toxic Orb is actually the plan, since getting poisoned activates Poison Heal.",
    ],
    watchOut:
      "Strong special Ice- and Water-type attacks (Hidden Power Ice is gone, but Ice Beam from Slowking forms and others) hit it hard before it heals up. Hatterene's Magic Bounce reflects its Spikes back.",
  },
  "Iron Moth": {
    summary:
      "Iron Moth is a Protosynthesis-boosted Fire/Poison special attacker that terrorizes balance teams with Fiery Dance's chance to raise Special Attack. Morning Sun gives it longevity unusual for a Booster Energy attacker, and its typing checks Fairy- and Grass-types like Hatterene and Rillaboom.",
    whenToUse: [
      "With Booster Energy Speed to outpace the tier and snowball Fiery Dance boosts — the more it attacks, the stronger it gets.",
      "On teams that struggle against Fairy-types, since Fire/Poison resists both of their common STABs.",
      "As a Tera Fairy or Tera Grass wallbreaker that flips the script on its Ground and Water counters.",
    ],
    watchOut:
      "Stealth Rock chips away its Booster Energy advantage, and Blissey plus Ting-Lu wall its special output. Ground-types like Great Tusk force it out repeatedly.",
  },
  "Iron Valiant": {
    summary:
      "Iron Valiant is the tier's scariest mixed attacker: with Booster Energy it outspeeds virtually everything, and its movepool — Moonblast, Close Combat, Knock Off, Spirit Break — has no safe switch-in. Booster Energy sets function as both wallbreaker and revenge killer simultaneously.",
    whenToUse: [
      "On hyper offense, where its ability to pick off weakened threats while breaking walls wins tempo battles.",
      "With Booster Energy Attack + Swords Dance to break through Toxapex and Blissey after a boost.",
      "As a Knock Off pivot that strips items from incoming walls before they can stabilize.",
    ],
    watchOut:
      "Its frailty means priority moves like Kingambit's Sucker Punch revenge kill it easily. Poison-types such as Gliscor and Toxapex tank its Fairy STAB and force prediction.",
  },
  Garganacl: {
    summary:
      "Garganacl is a one-Pokemon stall engine: Purifying Salt makes it immune to status and halves Ghost damage, while Salt Cure chips whatever it touches for 25% per turn (half that for Steel and Rock types). Iron Defense + Body Press or Curse sets convert that chip into an unstoppable late-game sweep.",
    whenToUse: [
      "As the defensive backbone of balance and stall teams, checking physical attackers like Kingambit and Dragonite.",
      "With Curse + Salt Cure + Recover to outlast entire defensive cores on fatter teams.",
      "Against hazard-reliant opponents — its immunity to burn, poison and Thunder Wave neuters most passive play.",
    ],
    watchOut:
      "Special Fighting- and Ground-type attacks (Focus Blast, Earth Power) bypass its physical bulk, and Taunt shuts down its Recover loop. Trick cripples it with a Choice item.",
  },
  "Ting-Lu": {
    summary:
      "Ting-Lu is the tier's bulkiest special sponge: Vessel of Ruin cuts every opposing Pokemon's Special Attack by 25% on top of its massive HP and Special Defense. It stacks Stealth Rock and Spikes, phases setup sweepers with Whirlwind and punishes switches with heavy Earthquakes.",
    whenToUse: [
      "As the special wall on hazard-stacking balance teams that need Iron Moth, Gholdengo and Raging Bolt checked.",
      "With a specially defensive spread to pivot into special attacks all game while layers of hazards accumulate.",
      "As a Whirlwind user that resets opposing Dragonite and Iron Boulder sweeps before they start.",
    ],
    watchOut:
      "Fighting-types like Great Tusk and Zamazenta hit its physical side hard, and Fairy-type Moonblast from Clefable bypasses Vessel of Ruin's incentive to stay in. Taunt also shuts down its hazard setting.",
  },
  "Slowking-Galar": {
    summary:
      "Slowking-Galar is the tier's premier special pivot: Regenerator heals a third of its HP on every switch, Chilly Reception gives it a free pivot, and Future Sight enables teammates to break through shared checks two turns later. It checks Iron Moth, Gholdengo and Walking Wake almost by itself.",
    whenToUse: [
      "As the special wall on balance teams, cycling Chilly Reception to regenerate HP while bringing in breakers safely.",
      "Paired with physical attackers that abuse the Future Sight timer to hit shared checks from both sides.",
      "With Sludge Bomb and Fire coverage to check Hatterene and Iron Moth specifically.",
    ],
    watchOut:
      "Knock Off strips its Heavy-Duty Boots and makes Stealth Rock chip real. Ghost- and Dark-type attacks from Gholdengo and Kingambit exploit its typing.",
  },
  "Raging Bolt": {
    summary:
      "Raging Bolt combines a huge Special Attack with Thunderclap, a priority Electric attack that picks off faster threats at +1. Calm Mind sets snowball out of control once its counters are weakened, and Draining Kiss restores its HP while hitting Dark-types super effectively.",
    whenToUse: [
      "As a Calm Mind win condition on balance — after two boosts, very little can safely take a Thunderclap.",
      "On teams weak to fast sweepers, since Thunderclap revenge kills even boosted Dragapult and Iron Valiant.",
      "With Tera Fairy to flip its Dragon and Ground weaknesses into resistances mid-sweep.",
    ],
    watchOut:
      "Ground-types like Gliscor and Great Tusk are immune to its Electric STAB, and Blissey walls it indefinitely. Trick and Encore punish setup turns.",
  },
  "Samurott-Hisui": {
    summary:
      "Samurott-Hisui is the only Pokemon whose attacks set hazards: Ceaseless Edge applies Spikes damage AND a layer of Spikes with every hit. This makes it a nightmare for hazard-control teams, as removing its spikes requires outplaying a Pokemon that re-applies them by simply attacking.",
    whenToUse: [
      "On hyper offense and hazard-stacking teams where every Ceaseless Edge compounds the opponent's chip damage.",
      "With Swords Dance to turn it from a Spikes machine into a genuine Dark-type breaker.",
      "As an anti-lead against Defog Corviknight — it punishes the Defog turn with free damage or Spikes.",
    ],
    watchOut:
      "Fighting- and Fairy-types threaten it offensively, and faster attackers exploit its middling speed. Great Tusk's Rapid Spin can keep its Spikes in check if it can switch in safely.",
  },
  Dragonite: {
    summary:
      "Dragonite's Multiscale halves all damage when at full HP, letting it reliably set up Dragon Dances that other dragons could only dream of. Extreme Speed gives it priority against faster revenge killers, and Tera Normal turns that priority into a devastating STAB sweep.",
    whenToUse: [
      "On hyper offense as a Dragon Dance win condition — Multiscale buys the setup turn almost unconditionally.",
      "With Tera Normal Extreme Speed to clean up weakened teams through priority resistance.",
      "As a defensive pivot with Roost and Defog on balance teams that need a blanket physical check.",
    ],
    watchOut:
      "Stealth Rock breaks Multiscale and cuts its setup safety in half. Ice-, Dragon- and Fairy-type coverage revenge kills it, and Dondozo's Unaware ignores its boosts.",
  },
  "Tornadus-Therian": {
    summary:
      "Tornadus-Therian is the tier's ultimate momentum machine: Regenerator heals it on every pivot, and U-turn cycles against the specially defensive Pokemon it forces in. Hurricane threatens everything that doesn't resist it, while Knock Off and Taunt cripple the few Pokemon that can take a hit.",
    whenToUse: [
      "As a pivot on any balance or bulky offense team that wants to control tempo from turn one.",
      "With Heavy-Duty Boots to ignore Stealth Rock and pivot repeatedly without any cost.",
      "As a Knock Off + Taunt utility set that dismantles stall archetypes by itself.",
    ],
    watchOut:
      "Its raw power is underwhelming against dedicated special walls like Blissey. Electric- and Rock-type attacks punish its pivoting, though Regenerator often out-heals the chip.",
  },
  "Landorus-Therian": {
    summary:
      "Landorus-Therian remains the eternal glue of competitive teams: Intimidate softens physical attackers every time it switches in, and it compresses Stealth Rock, U-turn pivoting and an Earthquake that keeps Electric- and Steel-types honest — all in one team slot.",
    whenToUse: [
      "As the defensive pivot on offense teams that need Intimidate support against Kingambit and Great Tusk.",
      "With a Choice Scarf to revenge kill boosted sweepers while keeping U-turn momentum.",
      "As a Stealth Rock setter that threatens the Defog users trying to clear its own hazards.",
    ],
    watchOut:
      "Special Ice- and Water-type attacks hit it hard, and it lacks reliable recovery, so chip adds up over a long game. Tera Grass or Tera Water sets flip some of these matchups.",
  },
  Heatran: {
    summary:
      "Heatran is a specially offensive pillar with a unique niche: Magma Storm traps the opponent for 4-5 turns, letting it remove a wall while stacking Taunt and Stealth Rock on the rest of the team. Flash Fire also gives it free switches against Fire-type attacks aimed at teammates.",
    whenToUse: [
      "As a trapper that removes Blissey or Slowking for a teammate's special sweep.",
      "On balance teams that need a Fairy- and Grass-check with immediate offensive presence.",
      "With Air Balloon to scout Ground attacks aimed at its 4x weakness.",
    ],
    watchOut:
      "Fighting- and Ground-type attacks (Close Combat, Earthquake) OHKO or severely dent it. Great Tusk in particular switches in freely and threatens its Ground weakness.",
  },
  Blissey: {
    summary:
      "Blissey is the most reliable special wall in the game, blanking attackers like Iron Moth, Gholdengo and Raging Bolt with its colossal HP. Natural Cure removes status whenever it switches, and Soft-Boiled keeps it healthy through entire games of special pressure.",
    whenToUse: [
      "On stall and semi-stall as the cornerstone special answer that never needs Tera investment.",
      "As a Stealth Rock setter on defensive teams — it gets many free turns against special attackers.",
      "With Seismic Toss to chip the special sweepers that otherwise set up on it for free.",
    ],
    watchOut:
      "Any physical attacker turns it into a liability, and Knock Off removes its Leftovers. Ghost-types are immune to Seismic Toss and use Blissey as free setup fodder.",
  },
  Dondozo: {
    summary:
      "Dondozo is the tier's premier Unaware wall: it ignores the boosts of Dragonite, Kingambit and Iron Boulder, then wins the long game with Curse + Rest. Its sheer physical bulk makes it the default answer to almost every physical setup sweeper.",
    whenToUse: [
      "As the physical backbone of stall teams, absorbing boosted attacks that would otherwise end the game.",
      "With Curse + Rest + Earthquake to become a win condition itself once physical threats are exhausted.",
      "Paired with hazard setters — the longer the game, the more chip favors Dondozo.",
    ],
    watchOut:
      "Grass-type special attacks hit it for double damage, and Taunt shuts down its Rest cycle. Trick Room also flips the script on its slow, methodical pace.",
  },
  Corviknight: {
    summary:
      "Corviknight is the safest Defog user in the tier, checking Rillaboom, Great Tusk and most physical attackers while pivoting with U-turn. Pressure stalling lets it win one-on-one against foes relying on low-PP moves like Close Combat.",
    whenToUse: [
      "As the hazard remover on balance and bulky offense teams that also need a Kingambit check.",
      "With Body Press + Iron Defense to convert its bulk into offense against physical teams.",
      "As a slow U-turn pivot that brings in frail breakers without taking damage.",
    ],
    watchOut:
      "Special Electric- and Fire-type attackers (Zapdos, Iron Moth) exploit its special side, and Taunt blocks Defog. Ting-Lu can Whirlwind it out before it clears hazards.",
  },
  Toxapex: {
    summary:
      "Toxapex walls half the tier with Regenerator recovery and a Fighting/Water typing that blanks Great Tusk and Cinderace. Toxic Spikes poison entire teams passively, and Haze resets setup sweepers that try to use it as fodder.",
    whenToUse: [
      "On balance and stall teams as a blanket physical wall that heals off most of the damage it takes.",
      "As a Toxic Spikes setter that turns every forced switch into permanent poison chip.",
      "With Haze to stop Dragonite and Iron Boulder sweeps cold without needing to attack.",
    ],
    watchOut:
      "Ground- and Psychic-type special attacks hit it hard, and Gliscor is immune to its Toxic strategy. Taunt cuts off Recover and Haze turns.",
  },
  Alomomola: {
    summary:
      "Alomomola passes the largest Wishes in the game — half of its enormous HP — to teammates that lack recovery of their own. Combined with Regenerator, it heals a third of its HP every time it pivots out, making it the medical backbone of defensive teams.",
    whenToUse: [
      "On stall and balance teams to heal Dondozo, Corviknight and other walls that can't recover reliably.",
      "With Wish + Protect cycles that keep hazard-setters healthy through long games.",
      "As a pivot that absorbs physical hits, heals itself with Regenerator, and tries again.",
    ],
    watchOut:
      "It has almost no offensive presence, giving free turns to setup sweepers if Protect is read. Electric- and Grass-type special attacks punish it directly.",
  },
  "Ogerpon-Wellspring": {
    summary:
      "Ogerpon-Wellspring is a self-sufficient Water-type breaker: Water Absorb grants free switch-ins against Water attacks, and Ivy Cudgel's guaranteed critical hits ignore Defense boosts from Dondozo and Zamazenta. Swords Dance turns it into a late-game cleaner.",
    whenToUse: [
      "On bulky offense that wants a Water check and a win condition in the same slot.",
      "With Swords Dance + Horn Leech to set up while healing off the recoil the opponent hopes will stop you.",
      "Against Dondozo and Zamazenta specifically — Ivy Cudgel's crits bypass their defensive boosts.",
    ],
    watchOut:
      "Its rare weaknesses (Poison, Bug, Flying) mean coverage moves catch it off guard. Faster physical revenge killers punish its setup turns.",
  },
  Darkrai: {
    summary:
      "Darkrai is a high-risk, high-reward special breaker: Nasty Plot doubles its already strong Special Attack, and Hypnosis can put a counter to sleep — when it hits. Its speed tier outpaces most of the unboosted tier.",
    whenToUse: [
      "On hyper offense as a Nasty Plot win condition that punishes slower defensive cores.",
      "With Hypnosis to disable the one Pokemon that walls the rest of your team (60% of the time).",
      "As a Focus Blast carrier that breaks Blissey and Kingambit after a boost.",
    ],
    watchOut:
      "Kingambit's Sucker Punch revenge kills it reliably, and Blissey walls special sets lacking Focus Blast accuracy. Sleep turns are a gamble — plan for Hypnosis to miss.",
  },
  Garchomp: {
    summary:
      "Garchomp is the most flexible Ground-type in the tier: TankChomp spreads chip with Rough Skin + Rocky Helmet, Swords Dance sets clean up with Scale Shot, and it sets Stealth Rock on forced switches. Its 102 Speed tier sits above key threats like Kingambit and Iron Hands.",
    whenToUse: [
      "As a TankChomp on balance — every U-turn and contact move into it costs the opponent 25% of their HP.",
      "With Swords Dance + Scale Shot on offense to raise Attack and Speed simultaneously.",
      "As a Stealth Rock lead that threatens common hazard removers with Earthquake and Dragon STAB.",
    ],
    watchOut:
      "Ice-type coverage from special walls hits it for 4x damage, and Fairy-types wall its dual STAB. Faster special attackers exploit its middling special bulk.",
  },
  Hatterene: {
    summary:
      "Hatterene's Magic Bounce reflects entry hazards and status moves back at the opponent, making it a hard counter to hazard-stacking leads. A colossal Special Attack and Healing Wish support rounds out a unique Fairy/Psychic package that punishes passive play.",
    whenToUse: [
      "Against hazard-stack teams — every Stealth Rock aimed at your side bounces back to theirs.",
      "As a Trick Room setter on dedicated slow teams, flipping fast offensive archetypes upside down.",
      "With Calm Mind + Draining Kiss to become a win condition that heals as it boosts.",
    ],
    watchOut:
      "Physical Steel-, Ghost- and Poison-types hit it super effectively, and U-turn or Volt Switch pivots chip it while breaking potential bounce value. It is slow — faster breakers get multiple free turns.",
  },
  "Iron Boulder": {
    summary:
      "Iron Boulder is a Protosynthesis-boosted cleaner whose Mighty Cleave ignores Defense boosts, making Dondozo and Zamazenta unreliable answers. Its Speed tier with Booster Energy outpaces the entire unboosted tier and most Choice Scarf users.",
    whenToUse: [
      "On hyper offense as a late-game cleaner once faster threats and priority users are removed.",
      "With Swords Dance + Tera to break through the Psychic- and Ground-types that check it.",
      "As an anti-Unaware breaker — Mighty Cleave's critical hits ignore Dondozo's defensive boosts.",
    ],
    watchOut:
      "Its physical bulk is modest, and Kingambit's Sucker Punch revenge kills it before it cleans. Ground- and Water-type attacks punish its Rock typing on the switch.",
  },
  Cinderace: {
    summary:
      "Cinderace's Libero grants STAB on every move it uses, turning its enormous physical movepool into a wallbreaking Swiss army knife. Court Change uniquely swaps entry hazards to the opponent's side, punishing dedicated hazard-stack teams.",
    whenToUse: [
      "As a Libero breaker that picks the perfect coverage move for whatever switches in.",
      "With Court Change on teams that struggle against Spikes and Stealth Rock stacking.",
      "As a U-turn pivot with Pyro Ball and Sucker Punch for consistent offensive pressure.",
    ],
    watchOut:
      "Bulky Water-types like Dondozo wall its common sets, and Rocky Helmet punishes its contact moves. Faster special attackers exploit its average special bulk.",
  },
  Primarina: {
    summary:
      "Primarina is a specially dominant Water/Fairy win condition: Calm Mind boosts stack with Sparkling Aria's spread prevention and Draining Kiss recovery. Its typing checks Dark-, Dragon- and Fighting-types that plague balance teams.",
    whenToUse: [
      "As a Calm Mind win condition on balance teams — few special walls can outlast Draining Kiss loops.",
      "Against Kingambit and Urshifu teams, since its typing blanks their STAB combinations.",
      "With Energy Ball or Psychic coverage to hit the Water-types that otherwise wall it.",
    ],
    watchOut:
      "Special Poison- and Grass-type attacks hit it super effectively, and physically defensive walls stall out its PP. Encore punishes repeated Calm Mind turns.",
  },
  "Moltres-Galar": {
    summary:
      "Moltres-Galar punishes physical attackers for existing: Berserk boosts its Special Attack when it drops below half HP, and Nasty Plot sets turn that boost into a Dark/Flying special sweep. Its typing checks Great Tusk, Zamazenta and Iron Boulder.",
    whenToUse: [
      "As a Defog user on balance teams that also need a physical Fighting check.",
      "With Nasty Plot + Fiery Wrath to snowball after Berserk triggers from a physical hit.",
      "As a mid-game pivot that heals with Roost while threatening both sides of the damage spectrum.",
    ],
    watchOut:
      "Fairy-types hit it super effectively, and Stealth Rock chips its switch-ins hard. Electric-type attacks punish its Flying typing when it tries to Defog.",
  },
  Skarmory: {
    summary:
      "Skarmory stacks Spikes better than anything else in the tier while walling Great Tusk, Dragonite and Rillaboom with its colossal Defense. Body Press converts that bulk into offense, and Sturdy guarantees at least one action per game.",
    whenToUse: [
      "As the Spikes setter on balance and stall teams that want layered hazards all game.",
      "With Body Press + Iron Defense to become an offensive threat against physical teams.",
      "As a blanket answer to Iron Boulder and Dragonite that wins the long game with Roost.",
    ],
    watchOut:
      "Special Fire- and Electric-type attackers melt it, and Taunt stops its Spikes and Roost. Magnezone-style trapping (if present) removes it from the game entirely.",
  },
  Clefable: {
    summary:
      "Clefable's Magic Guard makes it immune to hazard chip, burn, poison and weather damage — the most complete passive-damage immunity in the game. It supports with Knock Off and Stealth Rock or wins with Calm Mind, checking Dragon- and Dark-types all the while.",
    whenToUse: [
      "As a cleric/wish-less support that sets Stealth Rock without fearing any chip damage.",
      "With Unaware on stall teams to blank Dragonite and Iron Boulder boosts.",
      "As a Calm Mind + Moonblast win condition that outlasts special walls lacking critical hits.",
    ],
    watchOut:
      "Strong Poison- and Steel-type attacks (Sludge Bomb, Make It Rain) hit it super effectively. Its low speed gives faster breakers free turns to pivot around it.",
  },
  Zapdos: {
    summary:
      "Zapdos threatens every hazard remover in the tier: Corviknight and Great Tusk fear its special STABs, and Static punishes contact moves with paralysis. Volt Switch keeps momentum while Hurricane and Heat Wave hit surprisingly hard for a defensive pick.",
    whenToUse: [
      "As the special defender on balance teams that checks Iron Moth, Corviknight and Tornadus-Therian.",
      "With Defog support of its own to remove hazards on foes that can't punish it.",
      "As a Static abuser — every Rapid Spin or U-turn into it risks full paralysis.",
    ],
    watchOut:
      "Stealth Rock limits its switch-ins over a long game, and Rock-type attacks hit for double. Blissey walls it, though Volt Switch keeps momentum either way.",
  },
  Glimmora: {
    summary:
      "Glimmora is the premier hyper offense lead: Toxic Debris sets a layer of Toxic Spikes every time it takes a physical hit, and its Special Attack punishes lead matchups with Meteor Beam or Power Gem. Mortal Spin gives it personal hazard removal.",
    whenToUse: [
      "As an HO lead that guarantees hazard pressure from turn one against most leads.",
      "With Focus Sash + Meteor Beam to break leads that try to taunt or attack it.",
      "As a Tera-boosted cleaner once Toxic Spikes have poisoned the opposing team.",
    ],
    watchOut:
      "Earthquake from Great Tusk or Landorus removes it in one hit if the sash is broken, and Magic Bounce Hatterene reflects its hazards entirely. Rapid Spin removes its Toxic Spikes layers.",
  },
  Pelipper: {
    summary:
      "Pelipper's Drizzle brings permanent rain, the engine of every rain archetype. It pivots with U-turn while Hurricane becomes perfectly accurate in its own weather, supporting Swift Swim sweepers that double their Speed under rain.",
    whenToUse: [
      "As the rain setter on dedicated weather offense — the team is built around its Drizzle.",
      "With U-turn to bring in Barraskewda or Archaludon without losing momentum.",
      "As a Knock Off + Roost utility set that disrupts answers while keeping rain up.",
    ],
    watchOut:
      "Opposing weather setters (Torkoal, Abomasnow) override its rain, and Electric-type attacks punish its pivoting. Losing Pelipper usually means losing the archetype.",
  },
  Barraskewda: {
    summary:
      "Barraskewda is the premier Swift Swim cleaner: under rain its Speed doubles beyond any Choice Scarf user, and Flip Turn keeps momentum while chip from Wave Crash and Liquidation breaks everything in its path.",
    whenToUse: [
      "On rain teams as the primary win condition once faster threats are weakened.",
      "With Flip Turn to pivot out of unfavorable matchups without losing rain turns.",
      "As a Close Combat carrier to break Ferrothorn-style answers after they've been chipped.",
    ],
    watchOut:
      "Outside of rain it is frail and slow enough to be revenge killed by anything. Water Absorb and Dry Skin Pokemon (like Ogerpon-Wellspring) switch in for free.",
  },
  Archaludon: {
    summary:
      "Archaludon is rain's secret weapon: Stamina boosts its Defense every time it's hit, and Electro Shot charges in one turn under rain to fire a 130 base power Electric attack at +1 Special Attack. Draco Meteor and Flash Cannon round out coverage that punishes switch-ins.",
    whenToUse: [
      "On rain teams as a setup sweeper that wins the weather mirror against other rain archetypes.",
      "With Stamina + Stamina boosting into an endgame Body Press or Electro Shot sweep.",
      "As a Sturdy wallbreaker that checks Flying- and Water-types in return.",
    ],
    watchOut:
      "Fighting- and Ground-type attacks exploit its weaknesses, and without rain Electro Shot's charge turn makes it vulnerable to disruption. Taunt ruins its setup turns.",
  },
  Incineroar: {
    summary:
      "Incineroar is the most-used Pokemon in VGC history for a reason: Intimidate cycles weaken physical attackers every switch, Fake Out buys free turns, and Parting Shot pivots while lowering the foe's stats. It fits on virtually every doubles team.",
    whenToUse: [
      "As the glue Pokemon on any VGC team — Intimidate plus Fake Out is always relevant.",
      "With Parting Shot to pivot out of bad matchups while setting up a teammate's sweep.",
      "As a Knock Off and Will-O-Wisp spreader that item-cripples and burns the opposing team.",
    ],
    watchOut:
      "It has no recovery and takes chip all game, so long games wear it down. Fighting-, Ground- and Water-type attackers exploit its weaknesses when Intimidate doesn't matter.",
  },
  Rillaboom: {
    summary:
      "Rillaboom's Grassy Surge powers Grassy Glide, a priority attack that revenge kills faster threats while terrain weakens Earthquakes across the field. Fake Out and U-turn support make it doubles' premier offensive pivot.",
    whenToUse: [
      "As a terrain setter on VGC teams — the grass support quirks also heal grounded teammates each turn.",
      "With Grassy Glide to pick off faster sweepers that would otherwise outspeed your whole team.",
      "As a Fake Out user that safely enables a partner's setup or protects a weak lead matchup.",
    ],
    watchOut:
      "Flying-types and Levitate users ignore its terrain entirely, and Ice-, Fire- and Poison-type coverage hits it hard. Terrain wars against opposing Psychic or Electric surge teams can neutralize Grassy Glide's priority.",
  },
  "Flutter Mane": {
    summary:
      "Flutter Mane is VGC's scariest special attacker: blazing Speed and Special Attack with Moonblast, Shadow Ball and Icy Wind coverage that hits almost everything at least neutrally. Booster Energy sets outspeed the entire unrestricted metagame.",
    whenToUse: [
      "As the primary special breaker on offensive VGC teams — it wins most one-on-one damage races.",
      "With Icy Wind support to simultaneously chip and slow faster opposing threats.",
      "As a Tera Fairy or Tera Steel variant that flips its weaknesses mid-match.",
    ],
    watchOut:
      "Priority moves (Sucker Punch, Grassy Glide) bypass its Speed entirely, and special walls in Trick Room reverse its greatest strength. Steel-types resist both of its STABs.",
  },
  Torkoal: {
    summary:
      "Torkoal is the sun engine of VGC: Drought boosts Fire attacks by 50% while weakening Water moves, and Eruption under sun hits both opponents for massive spread damage. Its low Speed also makes it a premier Trick Room attacker.",
    whenToUse: [
      "As the Drought setter on sun teams built around Protosynthesis attackers like Gouging Fire.",
      "With Eruption at high HP to delete both opposing Pokemon in a single protected turn.",
      "On Trick Room teams where its 20 base Speed becomes an asset instead of a liability.",
    ],
    watchOut:
      "Once its HP drops, Eruption's power falls off a cliff. Opposing weather setters override its sun, and Rock- and Water-type attacks punish it hard.",
  },
  "Iron Hands": {
    summary:
      "Iron Hands combines Belly Drum with enormous natural bulk, letting it set up to +6 Attack in situations no other Pokemon could survive. Quark Drive under Electric Terrain (or Booster Energy) patches its Speed enough to sweep weakened teams.",
    whenToUse: [
      "As a Belly Drum win condition behind Fake Out support from Incineroar or Rillaboom partners.",
      "On Electric Terrain teams where Quark Drive boosts its Speed without an item.",
      "As an Assault Vest tank that trades setup potential for all-game special bulk.",
    ],
    watchOut:
      "Its low Speed means faster threats and priority chip it before it moves, and burn (if it lands) ruins the Belly Drum plan. Ground-type attacks hit its weakness directly.",
  },
  Farigiraf: {
    summary:
      "Farigiraf's Armor Tail blocks opposing priority moves for its entire team — a unique effect that protects frail Trick Room setters and slow attackers from Sucker Punch and Grassy Glide. It sets Trick Room itself while hitting surprisingly hard with Hyper Voice.",
    whenToUse: [
      "As the Trick Room setter on dedicated slow teams, where Armor Tail protects the archetype from priority.",
      "With Helping Hand to boost a partner's damage on turns where Trick Room is already up.",
      "As a Psychic Noise anti-heal attacker against bulky recovery cores.",
    ],
    watchOut:
      "Once Trick Room expires, its low Speed becomes a liability against everything. Dark- and Bug-type attacks hit it super effectively.",
  },
  Amoonguss: {
    summary:
      "Amoonguss is doubles' premier redirector: Rage Powder pulls single-target attacks onto itself, protecting the partner while Spore puts a threat to sleep with one click. Regenerator keeps it healthy through repeated redirection cycles.",
    whenToUse: [
      "As the support anchor on Trick Room teams — redirection protects setters, Spore removes attackers.",
      "With Rage Powder to shield a Belly Drum Iron Hands or a setting-up partner.",
      "As a bulky Grass-type that checks Water- and Electric-type attackers all game.",
    ],
    watchOut:
      "Safety Goggles (when equipped by foes) bypass Rage Powder entirely, and Taunt shuts down Spore. Fire-, Ice- and Flying-type attacks exploit its weaknesses.",
  },
  Whimsicott: {
    summary:
      "Whimsicott's Prankster gives priority to status moves: Tailwind doubles team Speed before the opponent can react, Encore locks setup sweepers into useless moves, and Moonblast provides decent chip. It is the premier Tailwind enabler of doubles.",
    whenToUse: [
      "As the Tailwind setter on fast offensive teams that want 4 turns of doubled Speed.",
      "With Encore to punish setup and Protect reads, buying free turns for a partner.",
      "As a Beat Up carrier to instantly activate a partner's Justified boost (with the right teammate).",
    ],
    watchOut:
      "Dark-types are immune to its Prankster status moves, and its frailty means any attack that connects removes it. Once Tailwind fades, it contributes little offensively.",
  },
  "Urshifu-Rapid-Strike": {
    summary:
      "Urshifu-Rapid-Strike's Surging Strikes always lands critical hits — unboostable Defense is meaningless against it, and each crit ignores screens. Close Combat complements a Water/Fighting STAB combination with almost no defensive answers.",
    whenToUse: [
      "As the premier physical breaker on offensive VGC teams — Surging Strikes ignores Intimidate's effect on damage rolls too.",
      "With Aqua Step to raise its own Speed while attacking under water-boosting conditions.",
      "As a detection (Protect) pivot that scouts choice locks before committing to attacks.",
    ],
    watchOut:
      "Its frailty means strong neutral hits remove it quickly, and Electric-, Grass- and Fairy-type attacks exploit its weaknesses. Protect scouting blunts its all-in attacking turns.",
  },
  Ogerpon: {
    summary:
      "Ogerpon's Follow Me redirection protects partners in doubles while its Ivy Cudgel grants guaranteed critical hits on Water-, Fire-, Grass- or Rock-type STAB (depending on the mask). It is a self-sufficient offensive support hybrid.",
    whenToUse: [
      "As a Follow Me redirector that protects a Trick Room setter or Belly Drum user.",
      "With Swords Dance + Ivy Cudgel crits to break through boosted defensive cores.",
      "As a Water Absorb (Wellspring mask) pivot against rain and Water-heavy teams.",
    ],
    watchOut:
      "Its frailty catches up against strong neutral attackers, and its mask choice locks its coverage plan. Poison-, Bug- and Flying-type moves hit its common weaknesses.",
  },
  Groudon: {
    summary:
      "Groudon is the quintessential restricted-box legendary for VGC: Drought fuels its own Precipice Blades while enabling Protosynthesis partners, and its raw Attack ends games in two hits. A bulky Drought setter also blanks Water-type attackers by weakening their moves.",
    whenToUse: [
      "As the restricted slot on sun teams — Drought supports the whole archetype while Groudon itself breaks.",
      "With Precipice Blades as spread Earthquake-style damage that also protects a Flying or Levitate partner.",
      "As a Swords Dance win condition behind redirection support from Amoonguss or Ogerpon.",
    ],
    watchOut:
      "Opposing weather setters override its sun, and special Water attacks (in non-sun turns) exploit its weakness. Ice-type coverage dents it on the switch.",
  },
  Kyogre: {
    summary:
      "Kyogre's Drizzle powers Origin Pulse and Water Spout to absurd levels — a full-HP Water Spout under rain hits both opponents harder than almost anything in the game. It defines rain archetypes in every restricted format it's legal in.",
    whenToUse: [
      "As the restricted slot on rain teams — its own Drizzle is the weather engine.",
      "With Water Spout at high HP behind redirection support for maximum spread damage.",
      "As a Choice Specs wallbreaker when you need immediate power over setup.",
    ],
    watchOut:
      "Water Spout's damage scales down with its HP, so chip destroys its output. Grass- and Electric-type attackers punish it, and opposing Drought users weaken its rain.",
  },
  "Chi-Yu": {
    summary:
      "Chi-Yu's Beads of Ruin cuts every foe's Special Defense by 25%, amplifying its own nuking Heat Waves and its partners' special attacks simultaneously. In doubles it turns any special teammate into a wallbreaker.",
    whenToUse: [
      "As a special nuke on offensive VGC teams — Overheat under Beads of Ruin OHKOs most neutral targets.",
      "Paired with special attackers like Flutter Mane that abuse the opposing Special Defense drop.",
      "With Protect and substitute-style play to preserve it for the right moment.",
    ],
    watchOut:
      "Its frailty means priority and faster attackers remove it quickly. Water-, Rock- and Ground-type attacks exploit its weaknesses when Beads of Ruin doesn't matter.",
  },
  "Roaring Moon": {
    summary:
      "Roaring Moon is a Protosynthesis Dragon Dance sweeper that, under sun or with Booster Energy, outspeeds and OHKOs most of the metagame after a boost. Acrobatics with no item and Knock Off give it coverage beyond its Dragon STAB.",
    whenToUse: [
      "As a Dragon Dance win condition on sun teams where Protosynthesis boosts its Speed for free.",
      "With Booster Energy + Acrobatics on hyper offense for an itemless, unstoppable cleaner.",
      "As a Knock Off pivot that strips items while waiting for the right setup turn.",
    ],
    watchOut:
      "Its 4x Ice weakness and 2x Fairy/Dragon weaknesses mean common coverage revenge kills it. Kingambit's Sucker Punch bypasses its Speed boosts entirely.",
  },
  "Gouging Fire": {
    summary:
      "Gouging Fire is sun's Protosynthesis breaker: massive Attack with Dragon and Fire STAB that punish switch-ins under Drought. Breaking Swipe spreads damage in doubles while Burn Up-style Fire coverage hits would-be Steel answers.",
    whenToUse: [
      "On sun teams as the primary physical breaker next to Torkoal or Groudon.",
      "With Protosynthesis Attack boosts to break Dondozo-style walls after chip.",
      "As a spread attacker in doubles using Breaking Swipe to damage both foes at once.",
    ],
    watchOut:
      "Ground- and Dragon-type attacks exploit its weaknesses, and outside of sun it loses the Protosynthesis edge. Faster Dragons win the damage race against it.",
  },
  "Iron Bundle": {
    summary:
      "Iron Bundle is the fastest relevant attacker in doubles: with Booster Energy or Electric Terrain, its Speed outruns the entire metagame while Freeze-Dry hits Water-types for super effective damage through their resistance.",
    whenToUse: [
      "As a revenge killer and cleaner on offensive VGC teams — nothing unboosted outspeeds it.",
      "With Freeze-Dry to hit the Water-types that usually wall Electric attackers.",
      "As an Icy Wind support variant that chips and slows both opponents while staying fast.",
    ],
    watchOut:
      "Its special bulk is poor, and priority moves bypass its Speed advantage. Ground-type attacks exploit its Electric typing when it tries to stay in.",
  },
  Tornadus: {
    summary:
      "Tornadus is VGC's Prankster Tailwind setter: priority Tailwind doubles team Speed before anything can respond, and Bleakwind Storm chips both opponents while lowering their Speed. Taunt and Rain Dance round out a complete support package.",
    whenToUse: [
      "As the Tailwind enabler on fast teams — priority weather control wins speed wars before they start.",
      "With Bleakwind Storm to spread damage and speed drops across the opposing side.",
      "As a Taunt user that shuts down opposing Trick Room and setup before they happen.",
    ],
    watchOut:
      "Dark-types are immune to its Prankster moves, and its frailty means any strong hit removes it. Once Tailwind expires, its offensive contribution drops sharply.",
  },
  "Ursaluna-Bloodmoon": {
    summary:
      "Ursaluna-Bloodmoon's Blood Moon is one of the strongest single attacks in the game — a 140 base power Normal-type special move backed by a colossal Special Attack stat. In Trick Room it deletes almost anything that isn't a Ghost.",
    whenToUse: [
      "As the Trick Room win condition on slow doubles teams — under Trick Room, nothing outpaces it.",
      "With Blood Moon as a one-click nuke that 2HKOs even resisted targets after minimal chip.",
      "As a Vacuum Wave priority user for picks outside of Trick Room turns.",
    ],
    watchOut:
      "Its Speed is abysmal outside Trick Room, and Ghost-types are immune to Blood Moon entirely. Fighting-type attacks exploit its weakness when it's forced to take a hit.",
  },
};
