"use client";

import type { PokemonBase, PokemonListItem, PokemonType, PokemonForm } from "@/types/pokemon";

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

function capitalize(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function cleanPokemonName(name: string): string {
  return capitalize(name.replace(/-(male|female)$/, ""));
}

let pokemonListCache: PokemonListItem[] | null = null;

const POKEMON_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel",
];

const HIDDEN_POWER_REGEX = /^hidden-power-(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel)$/;

export async function getPokemonList(): Promise<PokemonListItem[]> {
  if (pokemonListCache) return pokemonListCache;

  const data = await fetchWithCache<{
    results: { name: string; url: string }[];
  }>(`${POKEAPI_BASE}/pokemon?limit=9999&offset=0`);

  pokemonListCache = data.results.map((r) => {
    const urlParts = r.url.split("/").filter(Boolean);
    const id = parseInt(urlParts.pop() || "0", 10);
    return {
      name: r.name,
      id,
    };
  });

  return pokemonListCache;
}

interface PokeAPIPokemon {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
  moves: { move: { name: string } }[];
  forms: { name: string; url: string }[];
  sprites: {
    front_default: string;
    front_female: string | null;
    other: {
      "official-artwork": {
        front_default: string;
        front_female?: string | null;
      };
      home?: {
        front_default?: string | null;
        front_female?: string | null;
      };
    };
  };
}

interface PokeAPIForm {
  form_name: string;
  form_names: { language: { name: string }; name: string }[];
  is_default: boolean;
  pokemon: { name: string; url: string };
  sprites: {
    front_default: string;
    front_female: string | null;
    back_default: string | null;
    back_female: string | null;
  };
}

interface PokeAPISpecies {
  name: string;
  gender_rate: number;
  has_gender_differences: boolean;
  varieties: {
    is_default: boolean;
    pokemon: { name: string; url: string };
  }[];
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

  const moves = data.moves.map((m) => m.move.name);

  const hiddenPowerIndex = moves.indexOf("hidden-power");
  if (hiddenPowerIndex !== -1) {
    moves.splice(hiddenPowerIndex, 1, ...POKEMON_TYPES.map((t) => `hidden-power-${t}`));
  }

  const spriteUrl =
    data.sprites.other["official-artwork"].front_default ??
    getPokemonSpriteUrl(data.id);

  const spriteFemaleUrl =
    data.sprites.other["official-artwork"].front_female ??
    data.sprites.other.home?.front_female ??
    data.sprites.front_female ??
    undefined;

  // Fetch species data for gender/forms and clean display name
  let genderDifferences = false;
  let genderRate = -1;
  let forms: PokemonForm[] | undefined;
  let speciesName: string | undefined;

  try {
    const species = await fetchWithCache<PokeAPISpecies>(
      `https://pokeapi.co/api/v2/pokemon-species/${data.id}/`
    );

    speciesName = species.name;
    genderRate = species.gender_rate;
    genderDifferences = species.has_gender_differences && species.gender_rate !== -1;

    const seenFormNames = new Set<string>();
    const allForms: PokemonForm[] = [];

    // 1. Process species.varieties (species-level alternate forms)
    for (const v of species.varieties) {
      if (v.is_default) continue;
      if (species.has_gender_differences && v.pokemon.name.endsWith("-female")) continue;
      const urlParts = v.pokemon.url.split("/").filter(Boolean);
      const formId = parseInt(urlParts.pop() || "0", 10);
      const formName = v.pokemon.name;
      const baseName = speciesName ?? data.name;
      const stripped = formName.startsWith(`${baseName}-`)
        ? formName.slice(baseName.length + 1)
        : formName;
      seenFormNames.add(formName);
      allForms.push({
        name: formName,
        displayName: capitalize(stripped.replace(/-/g, " ")),
        spriteUrl: getPokemonFormSpriteUrl(formId),
        id: formId,
      });
    }

    // 2. Process data.forms (cosmetic forms like Gastrodon, Vivillon)
    const currentPokemonId = data.id;
    for (const f of data.forms) {
      if (f.name === data.name) continue;
      if (seenFormNames.has(f.name)) continue;
      if (species.has_gender_differences && f.name.endsWith("-female")) continue;
      try {
        const formDetail = await fetchWithCache<PokeAPIForm>(f.url);
        const formSpriteUrl = formDetail.sprites.front_default ?? getPokemonSpriteUrl(currentPokemonId);
        const englishName = formDetail.form_names.find(
          (n) => n.language.name === "en"
        );
      allForms.push({
        name: f.name,
        displayName: englishName?.name ?? capitalize(formDetail.form_name),
        spriteUrl: formSpriteUrl,
        id: currentPokemonId,
        cosmetic: true,
      });
        seenFormNames.add(f.name);
      } catch {
        // form fetch failed silently
      }
    }

    if (allForms.length > 0) forms = allForms;
  } catch {
    // species fetch failed silently
  }

  return {
    id: data.id,
    name: data.name,
    displayName: capitalize(speciesName ?? data.name),
    types: data.types.map((t) => t.type.name as PokemonType),
    abilities: data.abilities.map((a) => a.ability.name),
    moves: moves.slice(0, 100),
    baseStats,
    spriteUrl,
    spriteFemaleUrl,
    speciesUrl: `https://pokeapi.co/api/v2/pokemon-species/${data.id}/`,
    genderDifferences,
    genderRate,
    forms,
  };
}

export function getPokemonSpriteUrl(id: number): string {
  return `${SPRITE_BASE}/${id}.png`;
}

export function getPokemonFormSpriteUrl(
  id: number,
  gender?: "male" | "female",
  femaleSpriteUrl?: string
): string {
  if (gender === "female" && femaleSpriteUrl) {
    return femaleSpriteUrl;
  }
  return `${SPRITE_BASE}/${id}.png`;
}

export async function getFormPokemonData(formName: string): Promise<PokemonBase> {
  return getPokemonData(formName);
}

// ─── Items ───────────────────────────────────────────────

export interface ItemInfo {
  name: string;
  displayName: string;
}

export interface ItemDetail {
  name: string;
  displayName: string;
  effect: string | null;
}

const ITEMS_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

const BATTLE_CATEGORIES = [
  "held-items",
  "choice",
  "berries",
  "effort-drop",
  "in-a-pinch",
  "picky-healing",
  "type-protection",
  "type-enhancement",
  "species-specific",
  "training",
  "bad-held-items",
  "jewels",
  "mega-stones",
  "plates",
];

let battleItemsCache: ItemInfo[] | null = null;

export async function getBattleItems(): Promise<ItemInfo[]> {
  if (battleItemsCache) return battleItemsCache;

  const seen = new Set<string>();
  const items: ItemInfo[] = [];

  const results = await Promise.allSettled(
    BATTLE_CATEGORIES.map((cat) =>
      fetchWithCache<{ name: string; items: { name: string }[] }>(
        `${POKEAPI_BASE}/item-category/${cat}`
      )
    )
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const item of result.value.items) {
      if (item.name === "???" || item.name.startsWith("x-")) continue;
      if (seen.has(item.name)) continue;
      seen.add(item.name);
      items.push({
        name: item.name,
        displayName: item.name
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      });
    }
  }

  battleItemsCache = items;
  return items;
}

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

  const hpMatch = moveName.match(HIDDEN_POWER_REGEX);
  if (hpMatch) {
    const hpType = hpMatch[1] as PokemonType;
    const info: MoveInfo = {
      name: moveName,
      displayName: `Hidden Power ${hpType.charAt(0).toUpperCase() + hpType.slice(1)}`,
      type: hpType,
      category: "special",
      power: 60,
      accuracy: 100,
      pp: 15,
      ppMax: getMaxPp(15),
      effect: `A unique attack that varies in type depending on the Pokémon's IVs. This Hidden Power is ${hpType} type.`,
    };
    moveCache.set(moveName, info);
    return info;
  }

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
