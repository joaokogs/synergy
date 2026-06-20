export type PokemonStat = "hp" | "atk" | "def" | "spa" | "spd" | "spe";

export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export interface PokemonBase {
  id: number;
  name: string;
  displayName: string;
  types: PokemonType[];
  abilities: string[];
  moves: string[];
  baseStats: Record<PokemonStat, number>;
  spriteUrl: string;
}

export interface TeamPokemon {
  slot: number;
  pokemon: PokemonBase;
  item: string | null;
  ability: string | null;
  teraType: PokemonType | null;
  moves: (string | null)[]; // max 4
  ivs: Record<PokemonStat, number>;
  evs: Record<PokemonStat, number>;
  nature: string | null;
  level: number;
}

export interface Team {
  name: string;
  format: string;
  members: (TeamPokemon | null)[]; // 6 slots
}

export interface PokemonListItem {
  name: string;
  id: number;
}
