"use client";

import type { PokemonBase, PokemonListItem, PokemonType } from "@/types/pokemon";

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

const cache = new Map<string, unknown>();

async function fetchWithCache<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url) as T;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PokéAPI error: ${res.status} ${res.statusText}`);
  const data = (await res.json()) as T;
  cache.set(url, data);
  return data;
}

let pokemonListCache: PokemonListItem[] | null = null;

export async function getPokemonList(): Promise<PokemonListItem[]> {
  if (pokemonListCache) return pokemonListCache;

  const data = await fetchWithCache<{
    results: { name: string; url: string }[];
  }>(`${POKEAPI_BASE}/pokemon?limit=1025&offset=0`);

  pokemonListCache = data.results.map((r, i) => ({
    name: r.name,
    id: i + 1,
  }));

  return pokemonListCache;
}

interface PokeAPIPokemon {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
  moves: { move: { name: string } }[];
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
}

export async function getPokemonData(
  nameOrId: string | number
): Promise<PokemonBase> {
  const data = await fetchWithCache<PokeAPIPokemon>(
    `${POKEAPI_BASE}/pokemon/${nameOrId}`
  );

  const statMap: Record<string, "hp" | "atk" | "def" | "spa" | "spd" | "spe"> =
    {
      hp: "hp",
      attack: "atk",
      defense: "def",
      "special-attack": "spa",
      "special-defense": "spd",
      speed: "spe",
    };

  const baseStats = {} as Record<
    "hp" | "atk" | "def" | "spa" | "spd" | "spe",
    number
  >;
  for (const s of data.stats) {
    const key = statMap[s.stat.name];
    if (key) baseStats[key] = s.base_stat;
  }

  return {
    id: data.id,
    name: data.name,
    displayName: data.name.charAt(0).toUpperCase() + data.name.slice(1),
    types: data.types.map((t) => t.type.name as PokemonType),
    abilities: data.abilities.map((a) => a.ability.name),
    moves: data.moves
      .map((m) => m.move.name)
      .slice(0, 100),
    baseStats,
    spriteUrl: `${SPRITE_BASE}/${data.id}.png`,
  };
}

export function getPokemonSpriteUrl(id: number): string {
  return `${SPRITE_BASE}/${id}.png`;
}

// ─── Items ───────────────────────────────────────────────

export interface ItemInfo {
  name: string;
  displayName: string;
}

interface ItemDetail {
  name: string;
  displayName: string;
  effect: string | null;
}

const ITEMS_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

let itemListCache: ItemInfo[] | null = null;

export async function getItemList(): Promise<ItemInfo[]> {
  if (itemListCache) return itemListCache;

  const data = await fetchWithCache<{
    results: { name: string; url: string }[];
  }>(`${POKEAPI_BASE}/item?limit=2000&offset=0`);

  itemListCache = data.results
    .filter((r) => r.name !== "???" && !r.name.startsWith("x-"))
    .map((r) => ({
      name: r.name,
      displayName: r.name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    }));

  return itemListCache;
}

export function getItemSpriteUrl(itemName: string): string {
  return `${ITEMS_BASE}/${itemName}.png`;
}

export function getItemDisplayName(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const itemDetailCache = new Map<string, ItemDetail>();

export async function getItemData(itemName: string): Promise<ItemDetail | null> {
  const cached = itemDetailCache.get(itemName);
  if (cached) return cached;

  try {
    const data = await fetchWithCache<{
      name: string;
      effect_entries: { effect: string; language: { name: string } }[];
    }>(`${POKEAPI_BASE}/item/${itemName}`);

    const effect =
      data.effect_entries?.find((e) => e.language.name === "en")?.effect ?? null;

    const detail: ItemDetail = {
      name: data.name,
      displayName: getItemDisplayName(data.name),
      effect,
    };

    itemDetailCache.set(itemName, detail);
    return detail;
  } catch {
    return null;
  }
}

// ─── Abilities ──────────────────────────────────────────

export interface AbilityInfo {
  name: string;
  displayName: string;
  effect: string | null;
}

const abilityCache = new Map<string, AbilityInfo>();

export async function getAbilityData(abilityName: string): Promise<AbilityInfo | null> {
  const cached = abilityCache.get(abilityName);
  if (cached) return cached;

  try {
    const data = await fetchWithCache<{
      name: string;
      effect_entries: { effect: string; language: { name: string } }[];
    }>(`${POKEAPI_BASE}/ability/${abilityName}`);

    const effect =
      data.effect_entries?.find((e) => e.language.name === "en")?.effect ?? null;

    const info: AbilityInfo = {
      name: data.name,
      displayName: data.name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      effect,
    };

    abilityCache.set(abilityName, info);
    return info;
  } catch {
    return null;
  }
}

// ─── Moves ──────────────────────────────────────────────

export type MoveCategory = "physical" | "special" | "status";

export interface MoveInfo {
  name: string;
  displayName: string;
  type: PokemonType;
  category: MoveCategory;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  ppMax: number | null;
  effect: string | null;
}

export function getMaxPp(pp: number | null): number | null {
  if (pp === null) return null;
  return pp + Math.ceil(pp / 5) * 3;
}

const moveCache = new Map<string, MoveInfo>();

export async function getMoveData(moveName: string): Promise<MoveInfo | null> {
  const cached = moveCache.get(moveName);
  if (cached) return cached;

  try {
    const data = await fetchWithCache<{
      name: string;
      type: { name: string };
      damage_class: { name: string };
      power: number | null;
      accuracy: number | null;
      pp: number;
      effect_entries: { effect: string; language: { name: string } }[];
    }>(`${POKEAPI_BASE}/move/${moveName}`);

    const effect =
      data.effect_entries?.find((e) => e.language.name === "en")?.effect ?? null;

    const info: MoveInfo = {
      name: data.name,
      displayName: data.name
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      type: data.type.name as PokemonType,
      category: data.damage_class.name as MoveCategory,
      power: data.power,
      accuracy: data.accuracy,
      pp: data.pp,
      ppMax: getMaxPp(data.pp),
      effect,
    };

    moveCache.set(moveName, info);
    return info;
  } catch {
    return null;
  }
}

export async function getMovesData(
  moveNames: string[]
): Promise<(MoveInfo | null)[]> {
  return Promise.all(moveNames.map((m) => getMoveData(m)));
}
