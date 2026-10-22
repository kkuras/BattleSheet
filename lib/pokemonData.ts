// Natures disponíveis
export const NATURES = [
  "Adamant", "Bashful", "Bold", "Brave", "Calm",
  "Careful", "Docile", "Gentle", "Hardy", "Hasty",
  "Impish", "Jolly", "Lax", "Lonely", "Mild",
  "Modest", "Naive", "Naughty", "Quiet", "Quirky",
  "Rash", "Relaxed", "Sassy", "Serious", "Timid",
];

// Tera types
export const TERA_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy", "Stellar",
];

// Os 6 stats, na ordem que o Pokémon Showdown usa
export const STATS = [
  { key: "hp", label: "HP" },
  { key: "atk", label: "Atk" },
  { key: "def", label: "Def" },
  { key: "spa", label: "SpA" },
  { key: "spd", label: "SpD" },
  { key: "spe", label: "Spe" },
] as const;

// "hp" | "atk" | "def" | "spa" | "spd" | "spe", tirado da lista acima
export type StatKey = (typeof STATS)[number]["key"];

// Um número para cada stat, por exemplo { hp: 252, atk: 0}
export type StatSpread = Record<StatKey, number>;

// Regras de EV e IV por modo; o Champions entra aqui como outra entrada quando for implementado
export const STAT_RULES = {
  showdown: { evMaxPerStat: 252, evMaxTotal: 510, ivMax: 31 },
};

// EVs começam todos em 0
export function defaultEvs(): StatSpread {
  return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

// IVs começam todos em 31 (o máximo)
export function defaultIvs(): StatSpread {
  return { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
}

// Soma dos EVs de um Pokémon
export function evTotal(evs: StatSpread) {
  return STATS.reduce((sum, s) => sum + evs[s.key], 0);
}

// Opções de sexo: value é o que vai para o banco (como o Showdown escreve), label é o que aparece
export const GENDER_OPTIONS = [
  { value: "M", label: "♂ Macho" },
  { value: "F", label: "♀ Fêmea" },
] as const;