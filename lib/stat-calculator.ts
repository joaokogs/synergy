import type { PokemonStat } from "@/types/pokemon";

export const NATURE_MODIFIERS: Record<string, { boost: PokemonStat; reduce: PokemonStat }> = {
  "Hardy":   { boost: "atk", reduce: "atk" },
  "Lonely":  { boost: "atk", reduce: "def" },
  "Brave":   { boost: "atk", reduce: "spe" },
  "Adamant": { boost: "atk", reduce: "spa" },
  "Naughty": { boost: "atk", reduce: "spd" },
  "Bold":    { boost: "def", reduce: "atk" },
  "Docile":  { boost: "def", reduce: "def" },
  "Relaxed": { boost: "def", reduce: "spe" },
  "Impish":  { boost: "def", reduce: "spa" },
  "Lax":     { boost: "def", reduce: "spd" },
  "Timid":   { boost: "spe", reduce: "atk" },
  "Hasty":   { boost: "spe", reduce: "def" },
  "Serious": { boost: "spe", reduce: "spe" },
  "Jolly":   { boost: "spe", reduce: "spa" },
  "Naive":   { boost: "spe", reduce: "spd" },
  "Modest":  { boost: "spa", reduce: "atk" },
  "Mild":    { boost: "spa", reduce: "def" },
  "Quiet":   { boost: "spa", reduce: "spe" },
  "Bashful": { boost: "spa", reduce: "spa" },
  "Rash":    { boost: "spa", reduce: "spd" },
  "Calm":    { boost: "spd", reduce: "atk" },
  "Gentle":  { boost: "spd", reduce: "def" },
  "Sassy":   { boost: "spd", reduce: "spe" },
  "Careful": { boost: "spd", reduce: "spa" },
  "Quirky":  { boost: "spd", reduce: "spd" },
};

export function getNatureMultiplier(nature: string | null, stat: PokemonStat): number {
  if (!nature) return 1.0;
  const mod = NATURE_MODIFIERS[nature];
  if (!mod) return 1.0;
  if (mod.boost === mod.reduce) return 1.0;
  if (stat === "hp") return 1.0;
  if (stat === mod.boost) return 1.1;
  if (stat === mod.reduce) return 0.9;
  return 1.0;
}

export function getNatureEffect(nature: string | null, stat: PokemonStat): "boost" | "neutral" | "reduce" {
  if (!nature) return "neutral";
  const mod = NATURE_MODIFIERS[nature];
  if (!mod || mod.boost === mod.reduce) return "neutral";
  if (stat === "hp") return "neutral";
  if (stat === mod.boost) return "boost";
  if (stat === mod.reduce) return "reduce";
  return "neutral";
}

export function calculateStat(
  base: number,
  iv: number,
  ev: number,
  stat: PokemonStat,
  level: number = 50,
  nature: string | null = null
): number {
  const evComponent = Math.floor(ev / 4);
  let raw: number;
  if (stat === "hp") {
    raw = Math.floor(((2 * base + iv + evComponent) * level) / 100 + level + 10);
  } else {
    raw = Math.floor(((2 * base + iv + evComponent) * level) / 100 + 5);
  }
  return Math.floor(raw * getNatureMultiplier(nature, stat));
}

export function calculateAllStats(
  baseStats: Record<PokemonStat, number>,
  ivs: Record<PokemonStat, number>,
  evs: Record<PokemonStat, number>,
  level: number = 50,
  nature: string | null = null
): Record<PokemonStat, number> {
  const result = {} as Record<PokemonStat, number>;
  const stats: PokemonStat[] = ["hp", "atk", "def", "spa", "spd", "spe"];
  for (const stat of stats) {
    const evComponent = Math.floor(evs[stat] / 4);
    const isHp = stat === "hp";
    let raw: number;
    if (isHp) {
      raw = Math.floor(((2 * baseStats[stat] + ivs[stat] + evComponent) * level) / 100 + level + 10);
    } else {
      raw = Math.floor(((2 * baseStats[stat] + ivs[stat] + evComponent) * level) / 100 + 5);
    }
    result[stat] = Math.floor(raw * getNatureMultiplier(nature, stat));
  }
  return result;
}

export function getMaxPossibleStat(base: number, isHp: boolean): number {
  const level = 50;
  const evComponent = 63;
  if (isHp) {
    return Math.floor(((2 * base + 31 + evComponent) * level) / 100 + level + 10);
  }
  const raw = Math.floor(((2 * base + 31 + evComponent) * level) / 100 + 5);
  return Math.floor(raw * 1.1);
}

export const STAT_ORDER: PokemonStat[] = ["hp", "atk", "def", "spa", "spd", "spe"];

export function getStatLabel(stat: PokemonStat): string {
  const labels: Record<PokemonStat, string> = {
    hp: "HP",
    atk: "Atk",
    def: "Def",
    spa: "SpA",
    spd: "SpD",
    spe: "Spe",
  };
  return labels[stat];
}

export function getStatName(stat: PokemonStat): string {
  const names: Record<PokemonStat, string> = {
    hp: "HP",
    atk: "Attack",
    def: "Defense",
    spa: "Sp. Atk",
    spd: "Sp. Def",
    spe: "Speed",
  };
  return names[stat];
}
