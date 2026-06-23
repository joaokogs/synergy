"use client";

import type { PokemonStat } from "@/types/pokemon";

export interface BuildPokemon {
  pokemon: string;
  tier?: string;
  team?: string;
  format?: string;
  item: string | null;
  ability: string | null;
  teraType: string | null;
  nature: string | null;
  level: number;
  ivs: Record<PokemonStat, number>;
  evs: Record<PokemonStat, number>;
  moves: (string | null)[];
}

export interface PokedexConfig {
  tiers: Record<string, string[]>;
}

export const TIERS = ["OverUsed", "UnderUsed", "NeverUsed", "Doubles"] as const;
export type Tier = (typeof TIERS)[number];

let configCache: PokedexConfig | null = null;

export async function getPokedexConfig(): Promise<PokedexConfig> {
  if (configCache) return configCache;

  const res = await fetch("/config/pokedex.json");
  if (!res.ok) throw new Error("Failed to load pokedex config");

  const data = (await res.json()) as PokedexConfig;
  configCache = data;
  return data;
}

export async function getPokemonBuilds(pokemonName: string, tier: string): Promise<BuildPokemon[]> {
  const res = await fetch(`/api/builds?pokemon=${encodeURIComponent(pokemonName)}&tier=${encodeURIComponent(tier)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createBuild(build: BuildPokemon): Promise<{ success: boolean; error?: string }> {
  const res = await fetch("/api/builds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(build),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  return { success: true };
}

export async function updateBuild(build: BuildPokemon, originalTeam?: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch("/api/builds", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...build, originalTeam }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  return { success: true };
}

export async function deleteBuild(pokemon: string, team: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`/api/builds?pokemon=${encodeURIComponent(pokemon)}&team=${encodeURIComponent(team)}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  return { success: true };
}
