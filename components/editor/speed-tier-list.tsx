"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { getSpeedDataForTier, type SpeedEntry } from "@/lib/speed-data";
import { PokemonSprite } from "@/components/pokemon/pokemon-sprite";
import type { PokemonBase } from "@/types/pokemon";

interface SpeedTierListProps {
  currentPokemon: PokemonBase;
  tier: string;
}

const CENTER_RANGE = 15;

export function SpeedTierList({ currentPokemon, tier }: SpeedTierListProps) {
  const [entries, setEntries] = useState<SpeedEntry[] | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getSpeedDataForTier(tier).then((data) => {
      if (!cancelled) setEntries(data);
    });
    return () => { cancelled = true; };
  }, [tier]);

  const loading = entries === null;

  const allEntries = useMemo(() => {
    if (!entries) return null;
    const idx = entries.findIndex((e) => e.name === currentPokemon.name);
    if (idx !== -1) return entries;

    const currentEntry: SpeedEntry = {
      name: currentPokemon.name,
      displayName: currentPokemon.displayName,
      speed: currentPokemon.baseStats.spe,
      id: currentPokemon.id,
    };

    const merged = [...entries];
    const insertIdx = merged.findIndex((e) => e.speed <= currentEntry.speed);
    if (insertIdx === -1) {
      merged.push(currentEntry);
    } else {
      merged.splice(insertIdx, 0, currentEntry);
    }
    return merged;
  }, [entries, currentPokemon]);

  const displayedEntries = useMemo(() => {
    if (!allEntries) return [];
    const idx = allEntries.findIndex((e) => e.name === currentPokemon.name);
    if (idx === -1) return allEntries.slice(0, CENTER_RANGE * 2 + 1);

    const start = Math.max(0, idx - CENTER_RANGE);
    const end = Math.min(allEntries.length, idx + CENTER_RANGE + 1);
    return allEntries.slice(start, end);
  }, [allEntries, currentPokemon.name]);

  useEffect(() => {
    if (!listRef.current || !allEntries) return;
    const idx = allEntries.findIndex((e) => e.name === currentPokemon.name);
    if (idx === -1) return;

    const start = Math.max(0, idx - CENTER_RANGE);
    const targetIndex = idx - start;
    const itemHeight = 52;
    listRef.current.scrollTop = Math.max(0, targetIndex * itemHeight - 80);
  }, [allEntries, currentPokemon.name, displayedEntries.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-pk-text-primary border-t-transparent" />
          <span className="text-xs text-pk-text-secondary">Loading speed data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div ref={listRef} className="max-h-[400px] space-y-1 overflow-y-auto">
        {displayedEntries.map((entry) => {
          const isCurrent = entry.name === currentPokemon.name;

          return (
            <div
              key={entry.name}
              className={`flex items-center gap-3 rounded-md px-4 py-3 transition-colors ${
                isCurrent
                  ? "bg-pk-text-primary/10"
                  : "hover:bg-pk-hover-bg"
              }`}
            >
              <PokemonSprite
                id={entry.id}
                size={32}
                className="shrink-0"
              />
              <span className={`flex-1 truncate text-sm ${
                isCurrent ? "font-bold text-pk-text-primary" : "text-pk-text-secondary"
              }`}>
                {entry.displayName}
              </span>
              <span className={`shrink-0 text-right text-sm font-mono font-bold ${
                isCurrent ? "text-pk-text-primary" : "text-pk-text-secondary"
              }`}>
                {entry.speed}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
