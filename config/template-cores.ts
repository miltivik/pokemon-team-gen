/**
 * Curated representative Pokemon for each team archetype page.
 *
 * These rosters power internal links from /teams/[template] to the
 * /pokemon/[name] profile pages. They are representative of the archetype's
 * typical core in current Gen 9 play, not fixed in-game teams.
 */
export const TEMPLATE_CORES: Record<string, string[]> = {
  balanced: [
    "Great Tusk",
    "Kingambit",
    "Gholdengo",
    "Dragapult",
    "Toxapex",
    "Rillaboom",
  ],
  offense: [
    "Glimmora",
    "Roaring Moon",
    "Iron Valiant",
    "Iron Boulder",
    "Gouging Fire",
    "Kingambit",
  ],
  bulkyoffense: [
    "Great Tusk",
    "Kingambit",
    "Gholdengo",
    "Rillaboom",
    "Dragapult",
    "Gliscor",
  ],
  stall: [
    "Blissey",
    "Dondozo",
    "Corviknight",
    "Gliscor",
    "Clodsire",
    "Alomomola",
  ],
  semistall: [
    "Toxapex",
    "Blissey",
    "Skarmory",
    "Gliscor",
    "Great Tusk",
    "Iron Moth",
  ],
  weatheroffense: [
    "Torkoal",
    "Flutter Mane",
    "Incineroar",
    "Chi-Yu",
    "Venusaur",
    "Groudon",
  ],
  rain: [
    "Pelipper",
    "Barraskewda",
    "Archaludon",
    "Swampert",
    "Tornadus-Therian",
    "Raging Bolt",
  ],
  sun: [
    "Torkoal",
    "Walking Wake",
    "Iron Moth",
    "Great Tusk",
    "Hatterene",
    "Roaring Moon",
  ],
  sand: [
    "Tyranitar",
    "Excadrill",
    "Landorus-Therian",
    "Gholdengo",
    "Dragapult",
    "Zamazenta",
  ],
  trickroom: [
    "Hatterene",
    "Ursaluna",
    "Cresselia",
    "Iron Hands",
    "Torkoal",
    "Farigiraf",
  ],
  tailwind: [
    "Tornadus-Therian",
    "Whimsicott",
    "Iron Bundle",
    "Flutter Mane",
    "Rillaboom",
    "Incineroar",
  ],
  voltturn: [
    "Landorus-Therian",
    "Rotom-Wash",
    "Iron Moth",
    "Great Tusk",
    "Kingambit",
    "Ogerpon",
  ],
  hazardstack: [
    "Glimmora",
    "Skarmory",
    "Gliscor",
    "Great Tusk",
    "Gholdengo",
    "Samurott-Hisui",
  ],
};
