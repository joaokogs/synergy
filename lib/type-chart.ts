import type { PokemonType } from "@/types/pokemon";

export type Effectiveness = 0 | 0.25 | 0.5 | 1 | 2 | 4;

export const ALL_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel",
];

const CHART: Partial<Record<PokemonType, Partial<Record<PokemonType, Effectiveness>>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5, steel: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2 },
  poison: { poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0.5 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5, steel: 0.5 },
  dragon: { dragon: 2, steel: 0.5 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, steel: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5 },
};

const IMMUNE: Effectiveness = 0;
const RESIST: Effectiveness = 0.5;

export function getEffectiveness(attack: PokemonType, defend: PokemonType): Effectiveness {
  return CHART[attack]?.[defend] ?? 1;
}

export interface DefensiveResult {
  attackType: PokemonType;
  multiplier: number;
  label: string;
}

export interface AbilityOverride {
  type: PokemonType;
  multiplier: number;
}

const ABILITY_OVERRIDES: Record<string, AbilityOverride[]> = {
  levitate: [{ type: "ground", multiplier: IMMUNE }],
  "flash-fire": [{ type: "fire", multiplier: IMMUNE }],
  "water-absorb": [{ type: "water", multiplier: IMMUNE }],
  "volt-absorb": [{ type: "electric", multiplier: IMMUNE }],
  "lightning-rod": [{ type: "electric", multiplier: IMMUNE }],
  "motor-drive": [{ type: "electric", multiplier: IMMUNE }],
  "dry-skin": [
    { type: "water", multiplier: IMMUNE },
    { type: "fire", multiplier: 1.25 },
  ],
  "storm-drain": [{ type: "water", multiplier: IMMUNE }],
  "sap-sipper": [{ type: "grass", multiplier: IMMUNE }],
  "thick-fat": [
    { type: "fire", multiplier: RESIST },
    { type: "ice", multiplier: RESIST },
  ],
  heatproof: [{ type: "fire", multiplier: RESIST }],
  "purifying-salt": [{ type: "ghost", multiplier: RESIST }],
  "well-baked-body": [{ type: "fire", multiplier: IMMUNE }],
  "earth-eater": [{ type: "ground", multiplier: IMMUNE }],
  "water-bubble": [{ type: "fire", multiplier: RESIST }],
  "wind-rider": [{ type: "flying", multiplier: IMMUNE }],
};

export function getAbilityOverrides(ability: string | null): AbilityOverride[] {
  if (!ability) return [];
  const key = ability.toLowerCase().replace(/\s+/g, "-");
  return ABILITY_OVERRIDES[key] ?? [];
}

export function calculateDefensiveMultiplier(
  attackType: PokemonType,
  defendTypes: PokemonType[],
  ability: string | null,
  teraType: PokemonType | null,
): number {
  const abilityOverrides = getAbilityOverrides(ability);

  const abilityOverride = abilityOverrides.find((a) => a.type === attackType);
  if (abilityOverride) {
    return abilityOverride.multiplier;
  }

  if (teraType && !defendTypes.includes(teraType) && defendTypes.length > 0) {
    return getEffectiveness(attackType, teraType);
  }

  let multiplier = 1;
  for (const t of defendTypes) {
    multiplier *= getEffectiveness(attackType, t);
  }
  return multiplier;
}

const MULTIPLIER_LABELS: Record<number, string> = {
  0: "0×",
  0.25: "¼×",
  0.5: "½×",
  1: "—",
  2: "2×",
  4: "4×",
};

export function formatMultiplier(m: number): string {
  return MULTIPLIER_LABELS[m] ?? `${m}×`;
}
