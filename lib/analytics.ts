import type { TeamPokemon, PokemonType } from "@/types/pokemon";
import {
  ALL_TYPES,
  calculateDefensiveMultiplier,
} from "@/lib/type-chart";

export interface TeamMemberAnalysis {
  slot: number;
  displayName: string;
  spriteUrl: string;
  types: PokemonType[];
  ability: string | null;
  teraType: PokemonType | null;
  multipliers: Record<PokemonType, number>;
}

export interface TeamAnalysis {
  members: TeamMemberAnalysis[];
  weaknesses: Record<PokemonType, number>;
}

export function analyzeTeam(members: (TeamPokemon | null)[]): TeamAnalysis {
  const analyzed: TeamMemberAnalysis[] = [];

  for (const member of members) {
    if (!member) continue;

    const multipliers = {} as Record<PokemonType, number>;

    for (const attackType of ALL_TYPES) {
      multipliers[attackType] = calculateDefensiveMultiplier(
        attackType,
        member.pokemon.types,
        member.ability,
        member.teraType,
      );
    }

    analyzed.push({
      slot: member.slot,
      displayName: member.pokemon.displayName,
      spriteUrl: member.pokemon.spriteUrl,
      types: member.pokemon.types,
      ability: member.ability,
      teraType: member.teraType,
      multipliers,
    });
  }

  const weaknesses = {} as Record<PokemonType, number>;
  for (const attackType of ALL_TYPES) {
    weaknesses[attackType] = analyzed.reduce((worst, m) => {
      return Math.max(worst, m.multipliers[attackType]);
    }, 1);
  }

  return { members: analyzed, weaknesses };
}

export function getEffectiveCount(
  members: TeamMemberAnalysis[],
  attackType: PokemonType,
  threshold: number,
): number {
  return members.filter((m) => m.multipliers[attackType] >= threshold).length;
}
