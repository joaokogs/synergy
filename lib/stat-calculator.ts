import type { PokemonStat } from "@/types/pokemon";

export function calculateStat(
  base: number,
  iv: number,
  ev: number,
  level: number = 50,
  isHp: boolean = false
): number {
  const evComponent = Math.floor(ev / 4);
  if (isHp) {
    return Math.floor(((2 * base + iv + evComponent) * level) / 100 + level + 10);
  }
  return Math.floor(((2 * base + iv + evComponent) * level) / 100 + 5);
}

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
