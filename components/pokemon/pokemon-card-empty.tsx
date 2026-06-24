"use client";

import { Plus } from "lucide-react";

interface PokemonCardEmptyProps {
  slot: number;
  onClick: () => void;
}

export function PokemonCardEmpty({ slot, onClick }: PokemonCardEmptyProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Add Pokémon to slot ${slot}`}
      className="group flex w-full cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-pk-border bg-pk-card-bg p-4 transition-colors hover:border-pk-text-primary hover:bg-pk-hover-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pk-text-primary"
    >
      <div className="flex h-10 w-10 items-center justify-center border-2 border-pk-border transition-colors group-hover:border-pk-text-primary">
        <Plus className="h-5 w-5 text-pk-text-secondary transition-colors group-hover:text-pk-text-primary" />
      </div>
      <div className="text-center">
        <p className="text-[10px] font-medium uppercase tracking-wider text-pk-text-secondary">
          Slot {String(slot).padStart(2, "0")}
        </p>
        <p className="text-xs font-medium text-pk-text-primary">ADD POKÉMON</p>
      </div>
    </button>
  );
}
