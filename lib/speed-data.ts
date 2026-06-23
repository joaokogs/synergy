"use client";

import { getPokemonData } from "./pokeapi";
import { getPokedexConfig } from "./pokedex-config";

export interface SpeedEntry {
  name: string;
  displayName: string;
  speed: number;
  id: number;
}

const cache = new Map<string, SpeedEntry[]>();
const loadingPromises = new Map<string, Promise<SpeedEntry[]>>();

export async function getSpeedDataForTier(tier: string): Promise<SpeedEntry[]> {
  const cached = cache.get(tier);
  if (cached) return cached;

  const existing = loadingPromises.get(tier);
  if (existing) return existing;

  const promise = (async () => {
    const config = await getPokedexConfig();
    const pokemonList = config.tiers[tier] ?? [];
    const entries: SpeedEntry[] = [];

    const batchSize = 20;
    for (let i = 0; i < pokemonList.length; i += batchSize) {
      const batch = pokemonList.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((name) => getPokemonData(name))
      );
      for (const result of results) {
        if (result.status === "fulfilled") {
          entries.push({
            name: result.value.name,
            displayName: result.value.displayName,
            speed: result.value.baseStats.spe,
            id: result.value.id,
          });
        }
      }
    }

    entries.sort((a, b) => b.speed - a.speed);
    cache.set(tier, entries);
    return entries;
  })();

  loadingPromises.set(tier, promise);
  return promise;
}
