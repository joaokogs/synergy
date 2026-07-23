"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAbilityData } from "@/lib/pokeapi";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AbilitySelectorProps {
  abilities: string[];
  value: string | null;
  onChange: (ability: string | null) => void;
}

interface AbilityInfo {
  name: string;
  displayName: string;
  effect: string | null;
}

function formatAbilityName(name: string): string {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function AbilityOption({
  name,
  isSelected,
  onClick,
}: {
  name: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [info, setInfo] = useState<AbilityInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAbilityData(name).then((data) => {
      if (!cancelled && data) setInfo(data);
    });
    return () => { cancelled = true; };
  }, [name]);

  const displayName = formatAbilityName(name);

  const content = (
    <span className="text-pk-text-primary">{displayName}</span>
  );

  if (!info) {
    return (
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-pk-sidebar-bg",
          isSelected && "bg-pk-sidebar-bg font-medium"
        )}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            className={cn(
              "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-pk-sidebar-bg",
              isSelected && "bg-pk-sidebar-bg font-medium"
            )}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            {content}
          </button>
        )}
        nativeButton
        openOnHover
        delay={300}
        closeDelay={200}
      />
      <PopoverContent
        side="right"
        align="center"
        sideOffset={8}
        className="w-72 [&[data-slot=popover-content]]:rounded-none"
      >
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <p className="text-sm font-bold text-foreground">{info.displayName}</p>
        </div>
        {info.effect && (
          <p className="pt-2 text-xs leading-relaxed text-muted-foreground">{info.effect}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function AbilitySelector({ abilities, value, onChange }: AbilitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return abilities;
    const q = query.toLowerCase().trim();
    return abilities.filter((a) => a.toLowerCase().includes(q));
  }, [query, abilities]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setQuery("");
    setOpen(isOpen);
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  const triggerContent = (
    <div className="flex flex-1">
      <PopoverTrigger
        className={cn(
          "flex h-8 flex-1 items-center gap-2 border px-3 text-sm transition-colors",
          value
            ? "border-pk-border bg-pk-card-bg text-pk-text-primary"
            : "border-dashed border-pk-border bg-pk-card-bg text-pk-text-secondary hover:border-pk-text-primary",
          value && "border-r-0"
        )}
      >
        <span className={value ? "font-medium" : ""}>
          {value ? formatAbilityName(value) : "Ability"}
        </span>
        <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0" />
      </PopoverTrigger>
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-pk-border bg-pk-card-bg text-pk-text-secondary transition-colors hover:text-red-500"
          aria-label="Clear ability"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {triggerContent}

      <PopoverContent
        className="w-(--anchor-width) min-w-[280px] overflow-hidden! p-0!"
        align="start"
        sideOffset={4}
      >
        <div className="flex items-center border-b px-2">
          <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-pk-text-secondary" />
          <input
            ref={inputRef}
            placeholder="Search ability..."
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-pk-text-secondary"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[220px] overflow-y-auto">
          {filtered.map((ability) => (
            <AbilityOption
              key={ability}
              name={ability}
              isSelected={value === ability}
              onClick={() => { onChange(ability); setOpen(false); }}
            />
          ))}
          {filtered.length === 0 && (
            <div className="p-3 text-center text-sm text-pk-text-secondary">
              No abilities found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
