"use client";

import { useState, useEffect } from "react";
import { Zap, TrendingUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpeedTierList } from "./speed-tier-list";
import { getPokemonBuilds, type BuildPokemon, type Tier, TIERS } from "@/lib/pokedex-config";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { PokemonBase, PokemonStat } from "@/types/pokemon";

interface BuilderSidePanelProps {
  currentPokemon: PokemonBase;
  onUpdate: (updates: Partial<{ item: string | null; ability: string | null; teraType: string | null; nature: string | null; level: number }>) => void;
  onUpdateEvs: (evs: Partial<Record<PokemonStat, number>>) => void;
  onUpdateIvs: (ivs: Partial<Record<PokemonStat, number>>) => void;
  onUpdateMoves: (moves: (string | null)[]) => void;
}

type Tab = "popular" | "speed";

const STAT_LABELS: Record<PokemonStat, string> = {
  hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe",
};

function formatName(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function BuilderSidePanel({ currentPokemon, onUpdate, onUpdateEvs, onUpdateIvs, onUpdateMoves }: BuilderSidePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("speed");
  const [selectedTier, setSelectedTier] = useState<Tier>("OverUsed");
  const [tierOpen, setTierOpen] = useState(false);
  const [builds, setBuilds] = useState<BuildPokemon[] | null>(null);

  useEffect(() => {
    getPokemonBuilds(currentPokemon.name, selectedTier).then(setBuilds);
  }, [currentPokemon.name, selectedTier]);

  const handleApply = (build: BuildPokemon) => {
    onUpdate({
      item: build.item,
      ability: build.ability,
      nature: build.nature,
      level: build.level,
    });
    onUpdateMoves(build.moves);
    onUpdateEvs(build.evs);
    onUpdateIvs(build.ivs);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "popular", label: "Builds", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: "speed", label: "Speed", icon: <Zap className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
      <div className="border border-pk-border bg-pk-card-bg">
        {/* Header with tier select */}
        <div className="flex items-center gap-2 border-b border-pk-border px-3 py-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setTierOpen(!tierOpen)}
              className="flex items-center gap-1.5 rounded-sm border border-pk-border bg-pk-muted-bg px-2.5 py-1 text-[11px] font-bold text-pk-text-primary transition-colors hover:border-pk-text-primary/40"
            >
              {selectedTier}
              <ChevronDown className="h-3 w-3 text-pk-text-secondary" />
            </button>
            {tierOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded-sm border border-pk-border bg-pk-card-bg shadow-lg">
                {TIERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setSelectedTier(t); setTierOpen(false); }}
                    className={cn(
                      "flex w-full px-3 py-1.5 text-left text-xs transition-colors",
                      t === selectedTier
                        ? "bg-pk-text-primary/10 font-bold text-pk-text-primary"
                        : "text-pk-text-secondary hover:bg-pk-hover-bg hover:text-pk-text-primary"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-pk-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors",
                activeTab === tab.key
                  ? "border-b-2 border-pk-text-primary text-pk-text-primary"
                  : "text-pk-text-secondary hover:text-pk-text-primary"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-3">
          {activeTab === "popular" && (
            builds === null ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-pk-text-primary border-t-transparent" />
              </div>
            ) : builds.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <TrendingUp className="h-8 w-8 text-pk-text-secondary/40" />
                <p className="text-xs text-pk-text-secondary">
                  Nenhuma build {selectedTier} para {currentPokemon.displayName}.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {builds.map((build) => {
                  const key = build.team ?? "Build";
                  return (
                    <Popover key={key}>
                      <PopoverTrigger
                        render={<div />}
                        nativeButton={false}
                        openOnHover
                        delay={300}
                        closeDelay={200}
                        className="w-full"
                      >
                        <button
                          type="button"
                          onClick={() => handleApply(build)}
                          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-pk-border bg-pk-muted-bg px-4 py-5 text-center transition-all hover:border-pk-text-primary/40 hover:bg-pk-hover-bg"
                        >
                          <span className="text-sm font-bold text-pk-text-primary">
                            {formatName(build.team ?? "Build")}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="left"
                        align="center"
                        sideOffset={8}
                        className="w-72 [&[data-slot=popover-content]]:rounded-none"
                      >
                        <BuildDetails build={build} />
                      </PopoverContent>
                    </Popover>
                  );
                })}
              </div>
            )
          )}

          {activeTab === "speed" && (
            <SpeedTierList currentPokemon={currentPokemon} tier={selectedTier} />
          )}
        </div>
      </div>
    </div>
  );
}

function BuildDetails({ build }: { build: BuildPokemon }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <span className="text-xs font-bold text-foreground">
          {formatName(build.team ?? "Build")}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          Lv.{build.level}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        {build.item && (
          <>
            <span className="text-muted-foreground">Item</span>
            <span className="text-right font-medium text-foreground">{formatName(build.item)}</span>
          </>
        )}
        {build.ability && (
          <>
            <span className="text-muted-foreground">Ability</span>
            <span className="text-right font-medium text-foreground">{formatName(build.ability)}</span>
          </>
        )}
        {build.nature && (
          <>
            <span className="text-muted-foreground">Nature</span>
            <span className="text-right font-medium text-foreground">{formatName(build.nature)}</span>
          </>
        )}
        {build.teraType && (
          <>
            <span className="text-muted-foreground">Tera Type</span>
            <span className="text-right font-medium text-foreground">{formatName(build.teraType)}</span>
          </>
        )}
      </div>

      <div className="border-t border-border pt-1.5">
        <span className="text-[10px] font-semibold text-muted-foreground">EVs</span>
        <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
          {(Object.entries(build.evs) as [PokemonStat, number][])
            .filter(([, v]) => v > 0)
            .map(([s, v]) => (
              <span key={s} className="text-foreground">
                {STAT_LABELS[s]} <span className="font-mono font-bold">{v}</span>
              </span>
            ))}
          {Object.values(build.evs).every((v) => v === 0) && (
            <span className="text-muted-foreground">None</span>
          )}
        </div>
      </div>

      <div>
        <span className="text-[10px] font-semibold text-muted-foreground">IVs</span>
        <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
          {(Object.entries(build.ivs) as [PokemonStat, number][])
            .filter(([, v]) => v !== 31)
            .map(([s, v]) => (
              <span key={s} className="text-foreground">
                {STAT_LABELS[s]} <span className="font-mono font-bold">{v}</span>
              </span>
            ))}
          {Object.values(build.ivs).every((v) => v === 31) && (
            <span className="text-muted-foreground">31 all</span>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-1.5">
        <span className="text-[10px] font-semibold text-muted-foreground">Moves</span>
        <div className="mt-0.5 space-y-0.5">
          {build.moves.map((move, i) => (
            <div key={i} className="text-[11px] text-foreground">
              {i + 1}. {move ? formatName(move) : "—"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
