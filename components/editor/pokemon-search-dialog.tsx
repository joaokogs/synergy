"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getPokemonList, getPokemonData } from "@/lib/pokeapi";
import type { PokemonBase, PokemonListItem } from "@/types/pokemon";

interface PokemonSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (pokemon: PokemonBase) => void;
}

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export function PokemonSearchDialog({
  open,
  onOpenChange,
  onSelect,
}: PokemonSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonListItem[]>([]);
  const [list, setList] = useState<PokemonListItem[]>([]);

  useEffect(() => {
    getPokemonList().then(setList).catch(console.error);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = list
      .filter((p) => p.name.includes(q) || p.id.toString() === q)
      .slice(0, 30);
    setResults(filtered);
  }, [query, list]);

  const handleSelect = useCallback(
    async (item: PokemonListItem) => {
      try {
        const data = await getPokemonData(item.id);
        onSelect(data);
        onOpenChange(false);
      } catch {
        console.error("Failed to load Pokemon data");
      }
    },
    [onSelect, onOpenChange]
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
    onOpenChange(open);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      className="sm:max-w-xl"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search Pokémon..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No Pokémon found</CommandEmpty>
          <CommandGroup>
            {results.map((item) => (
              <CommandItem
                key={item.id}
                value={item.name}
                onSelect={() => handleSelect(item)}
                className="gap-3 px-3 py-2.5"
              >
                <Image
                  src={`${SPRITE_BASE}/${item.id}.png`}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="text-base">
                  #{String(item.id).padStart(3, "0")}{" "}
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
