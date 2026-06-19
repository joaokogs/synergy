"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NATURE_MODIFIERS, getStatLabel } from "@/lib/stat-calculator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface NatureSelectorProps {
  value: string | null;
  onChange: (nature: string | null) => void;
}

const NATURE_LIST = Object.keys(NATURE_MODIFIERS);

function getNatureEffects(nature: string) {
  const mod = NATURE_MODIFIERS[nature];
  if (!mod) return null;
  const isNeutral = mod.boost === mod.reduce;
  return {
    boost: isNeutral ? null : mod.boost,
    reduce: isNeutral ? null : mod.reduce,
    isNeutral,
  };
}

export function NatureSelector({ value, onChange }: NatureSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return NATURE_LIST;
    const q = query.toLowerCase().trim();
    return NATURE_LIST.filter((n) => n.toLowerCase().includes(q));
  }, [query]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setQuery("");
    setOpen(isOpen);
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className="flex">
        <PopoverTrigger
          className={cn(
            "flex h-9 flex-1 items-center gap-2 border px-3 text-sm transition-colors",
            value
              ? "border-pk-border bg-pk-card-bg text-pk-text-primary"
              : "border-dashed border-pk-border bg-pk-card-bg text-pk-text-secondary hover:border-pk-text-primary",
            value && "border-r-0"
          )}
        >
          <span className={value ? "font-medium" : ""}>
            {value ?? "Nature"}
          </span>
          <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0" />
        </PopoverTrigger>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-pk-border bg-pk-card-bg text-pk-text-secondary transition-colors hover:text-red-500"
            aria-label="Clear nature"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <PopoverContent
        className="w-(--anchor-width) min-w-[280px] overflow-hidden! p-0!"
        align="start"
        sideOffset={4}
      >
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-pk-text-secondary" />
          <input
            ref={inputRef}
            placeholder="Search nature..."
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-pk-text-secondary"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[280px] overflow-y-auto">
          {filtered.map((nature) => {
            const effects = getNatureEffects(nature);
            const isSelected = value === nature;
            return (
              <button
                key={nature}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-pk-hover-bg",
                  isSelected && "bg-pk-sidebar-bg"
                )}
                onClick={() => { onChange(nature); setOpen(false); }}
              >
                <span className="min-w-[68px] font-medium text-pk-text-primary">
                  {nature}
                </span>
                {effects && !effects.isNeutral ? (
                  <span className="ml-auto flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 rounded-sm bg-green-50 px-1.5 py-0.5 text-[11px] font-semibold text-green-600">
                      <span>↑</span>
                      {getStatLabel(effects.boost!)}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-sm bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-500">
                      <span>↓</span>
                      {getStatLabel(effects.reduce!)}
                    </span>
                  </span>
                ) : (
                  <span className="ml-auto text-[11px] text-pk-text-secondary">
                    Neutral
                  </span>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-sm text-pk-text-secondary">
              No natures found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
