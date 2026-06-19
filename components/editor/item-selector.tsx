"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getItemList, getItemSpriteUrl, type ItemInfo } from "@/lib/pokeapi";

interface ItemSelectorProps {
  value: string | null;
  onChange: (item: string | null) => void;
}

export function ItemSelector({ value, onChange }: ItemSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ItemInfo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getItemList().then(setItems).catch(console.error);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!open) return [];
    if (!query.trim()) return items.slice(0, 50);
    const q = query.toLowerCase().trim();
    return items
      .filter((item) => item.name.includes(q) || item.displayName.toLowerCase().includes(q))
      .slice(0, 50);
  }, [query, items, open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const selectedItem = value
    ? items.find((i) => i.name === value) ?? {
        name: value,
        displayName: value
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      }
    : null;

  return (
    <div ref={containerRef} className="relative">
      {selectedItem ? (
        <div className="flex h-9 items-center justify-between border border-pk-border bg-pk-card-bg px-3 text-sm">
          <button
            type="button"
            onClick={handleToggle}
            className="flex flex-1 items-center gap-2 text-left"
          >
            <img
              src={getItemSpriteUrl(selectedItem.name)}
              alt=""
              className="h-5 w-5 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-pk-text-primary">{selectedItem.displayName}</span>
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-1 flex h-5 w-5 items-center justify-center text-pk-text-secondary hover:text-red-500"
            aria-label="Remove item"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          className="flex h-9 w-full items-center border border-dashed border-pk-border bg-pk-card-bg px-3 text-sm text-pk-text-secondary transition-colors hover:border-pk-text-primary"
        >
          <Search className="mr-2 h-3.5 w-3.5" />
          Search item...
        </button>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 border border-pk-border bg-pk-card-bg shadow-lg">
          <div className="flex items-center border-b border-pk-border px-2">
            <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-pk-text-secondary" />
            <input
              ref={inputRef}
              placeholder="Search item..."
              className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-pk-text-secondary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            {filtered.map((item) => (
              <button
                key={item.name}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-pk-sidebar-bg",
                  value === item.name && "bg-pk-sidebar-bg font-medium"
                )}
                onClick={() => {
                  onChange(item.name);
                  setOpen(false);
                }}
              >
                <img
                  src={getItemSpriteUrl(item.name)}
                  alt=""
                  className="h-5 w-5 shrink-0 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="text-pk-text-primary">{item.displayName}</span>
              </button>
            ))}
            {filtered.length === 0 && open && (
              <div className="p-3 text-center text-sm text-pk-text-secondary">
                No items found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
