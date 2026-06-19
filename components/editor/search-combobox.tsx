"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getPokemonList, getPokemonData } from "@/lib/pokeapi";
import type { PokemonBase, PokemonListItem } from "@/types/pokemon";
import { cn } from "@/lib/utils";

interface SearchComboboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (pokemon: PokemonBase) => void;
}

export function SearchCombobox({
  open,
  onOpenChange,
  onSelect,
}: SearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonListItem[]>([]);
  const [list, setList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    getPokemonList().then(setList).catch(console.error);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      const q = query.toLowerCase().trim();
      const filtered = list
        .filter((p) => p.name.includes(q) || p.id.toString() === q)
        .slice(0, 30);
      setLoading(false);
      setResults(filtered);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, list]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
    onOpenChange(isOpen);
  };

  const handleSelect = async (item: PokemonListItem) => {
    try {
      const data = await getPokemonData(item.id);
      onSelect(data);
      onOpenChange(false);
    } catch {
      console.error("Failed to load Pokemon data");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger className="hidden">
        <span>Add Pokémon</span>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0"
        align="center"
        sideOffset={8}
      >
        <div className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-pk-text-secondary" />
            <input
              ref={inputRef}
              placeholder="Search Pokémon..."
              aria-label="Search Pokémon"
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-pk-text-secondary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-sm text-pk-text-secondary">
                Searching...
              </div>
            )}
            {!loading && results.length === 0 && query.trim() && (
              <div className="p-4 text-center text-sm text-pk-text-secondary">
                No Pokémon found
              </div>
            )}
            {results.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
                  "hover:bg-pk-sidebar-bg focus-visible:bg-pk-sidebar-bg focus-visible:outline-none"
                )}
                onClick={() => handleSelect(item)}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-pk-muted-bg text-xs text-pk-text-secondary">
                  #{String(item.id).padStart(3, "0")}
                </span>
                <span className="font-medium text-pk-text-primary">
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
