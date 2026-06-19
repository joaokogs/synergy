"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PokemonSprite } from "@/components/pokemon/pokemon-sprite";
import { TypeBadge } from "@/components/pokemon/type-badge";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getStatName } from "@/lib/stat-calculator";
import { ItemSelector } from "./item-selector";
import { MovesetEditor } from "./moveset-editor";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { TeamPokemon, PokemonStat, PokemonType } from "@/types/pokemon";

interface FullPageEditorProps {
  member: TeamPokemon;
  onBack: () => void;
  onUpdate: (updates: Partial<TeamPokemon>) => void;
  onUpdateEvs: (evs: Partial<Record<PokemonStat, number>>) => void;
  onUpdateIvs: (ivs: Partial<Record<PokemonStat, number>>) => void;
  onUpdateMoves: (moves: (string | null)[]) => void;
  hideHeader?: boolean;
}

const STAT_ORDER: PokemonStat[] = ["hp", "atk", "def", "spa", "spd", "spe"];

const NATURES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky",
];

const TERA_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export function FullPageEditor({
  member,
  onBack,
  onUpdate,
  onUpdateEvs,
  onUpdateIvs,
  onUpdateMoves,
  hideHeader = false,
}: FullPageEditorProps) {
  const { pokemon, ability, item, teraType, moves, ivs, evs, nature } = member;

  const [activeTab, setActiveTab] = useState("ev");

  const totalEvs = Object.values(evs).reduce((a, b) => a + b, 0);
  const remainingEvs = 510 - totalEvs;

  const handleEvSlider = (stat: PokemonStat, value: string) => {
    const num = Math.max(0, Math.min(252, parseInt(value) || 0));
    const currentTotal = totalEvs - evs[stat];
    const maxAllowed = Math.min(252, 510 - currentTotal);
    onUpdateEvs({ [stat]: Math.min(num, maxAllowed) });
  };

  const handleEvChange = (stat: PokemonStat, value: string) => {
    const num = Math.max(0, Math.min(252, parseInt(value) || 0));
    const currentTotal = totalEvs - evs[stat];
    if (currentTotal + num <= 510) {
      onUpdateEvs({ [stat]: num });
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {!hideHeader && (
      <div className="flex items-center justify-between border-b border-pk-border bg-pk-card-bg px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center text-pk-text-secondary transition-colors hover:text-pk-text-primary"
            aria-label="Back to team"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-pk-text-primary">
            Edit {pokemon.displayName}
          </h1>
        </div>
          <span className="text-xs font-mono text-pk-text-secondary">
            #{String(pokemon.id).padStart(3, "0")}
          </span>
        </div>
      )}

      {/* 3-column editor */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Left Column: Visual & Core Details */}
        <div className="flex w-[240px] shrink-0 flex-col gap-4 overflow-y-auto">
          {/* Sprite Card */}
          <div className="border border-pk-border bg-pk-card-bg p-4">
            <div className="flex flex-col items-center gap-2">
              <PokemonSprite
                id={pokemon.id}
                size={100}
                className="rounded-lg border-2 border-pk-border shadow-sm"
              />
              <div className="text-center">
                <h2 className="text-base font-bold text-pk-text-primary">
                  {pokemon.displayName}
                </h2>
                <div className="mt-0.5 flex justify-center gap-1">
                  {pokemon.types.map((t) => (
                    <TypeBadge key={t} type={t} className="text-[10px] px-2" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Nature & Level */}
          <div className="border border-pk-border bg-pk-card-bg p-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-pk-text-secondary">
                  Nature
                </label>
                <Select
                  value={nature ?? ""}
                  onValueChange={(v) => onUpdate({ nature: v || null })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select nature" />
                  </SelectTrigger>
                  <SelectContent>
                    {NATURES.map((n) => (
                      <SelectItem key={n} value={n} className="text-xs">
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-16 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-pk-text-secondary">
                  Level
                </label>
                <div className="flex h-8 items-center justify-center border border-pk-border bg-pk-muted-bg text-xs font-mono font-bold text-pk-text-primary">
                  50
                </div>
              </div>
            </div>
          </div>

          {/* Item / Ability / Tera */}
          <div className="space-y-3 border border-pk-border bg-pk-card-bg p-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-pk-text-secondary">
                Item
              </label>
              <ItemSelector
                value={item}
                onChange={(v) => onUpdate({ item: v })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-pk-text-secondary">
                Ability
              </label>
              <Select
                value={ability ?? ""}
                onValueChange={(v) => onUpdate({ ability: v || null })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select ability" />
                </SelectTrigger>
                <SelectContent>
                  {pokemon.abilities.map((a) => (
                    <SelectItem key={a} value={a} className="text-xs">
                      {a.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-pk-text-secondary">
                Tera Type
              </label>
              <Select
                value={teraType ?? ""}
                onValueChange={(v) =>
                  onUpdate({ teraType: (v || null) as PokemonType | null })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select tera type" />
                </SelectTrigger>
                <SelectContent>
                  {TERA_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Center Column: IVs / EVs */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
          <div className="border border-pk-border bg-pk-card-bg p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-3 flex items-center justify-between">
                <TabsList className="h-7">
                  <TabsTrigger value="iv" className="text-[10px] px-3 py-1">
                    IVs
                  </TabsTrigger>
                  <TabsTrigger value="ev" className="text-[10px] px-3 py-1">
                    EVs
                  </TabsTrigger>
                </TabsList>
                {activeTab === "ev" && (
                  <span className="text-xs font-mono font-bold text-pk-text-secondary">
                    {totalEvs} / 510 EVs
                  </span>
                )}
              </div>

              <TabsContent value="iv" className="mt-0">
                <div className="space-y-1.5">
                  {STAT_ORDER.map((stat) => (
                    <div key={stat} className="flex items-center gap-2">
                      <span className="w-10 text-[10px] font-medium text-pk-text-primary">
                        {getStatName(stat)}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={31}
                        aria-label={`${getStatName(stat)} IVs`}
                        value={ivs[stat]}
                        onChange={(e) => {
                          const num = Math.max(0, Math.min(31, parseInt(e.target.value) || 0));
                          onUpdateIvs({ [stat]: num });
                        }}
                        className="h-6 w-12 border border-pk-border bg-transparent px-1 text-center text-[10px] font-mono text-pk-text-primary outline-none focus:ring-1 focus:ring-pk-text-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const max: Partial<Record<PokemonStat, number>> = {};
                      STAT_ORDER.forEach((s) => { max[s] = 31; });
                      onUpdateIvs(max);
                    }}
                    className="text-[10px] font-medium text-pk-text-secondary underline underline-offset-2 transition-colors hover:text-pk-text-primary"
                  >
                    Max All
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="ev" className="mt-0">
                <div className="space-y-3">
                  {STAT_ORDER.map((stat) => (
                    <div key={stat} className="flex items-center gap-2">
                      <span className="w-10 shrink-0 text-[10px] font-medium text-pk-text-primary">
                        {getStatName(stat)}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={252}
                        value={evs[stat]}
                        onChange={(e) => handleEvSlider(stat, e.target.value)}
                        aria-label={`${getStatName(stat)} EVs`}
                        className="ev-slider h-1.5 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent"
                        style={{ '--ev-fill': `${(evs[stat] / 252) * 100}%` } as React.CSSProperties}
                      />
                      <input
                        type="number"
                        min={0}
                        max={252}
                        aria-label={`${getStatName(stat)} EVs`}
                        value={evs[stat]}
                        onChange={(e) => handleEvChange(stat, e.target.value)}
                        className="h-5 w-12 shrink-0 border border-pk-border bg-transparent px-1 text-center text-[10px] font-mono text-pk-text-primary outline-none focus:ring-1 focus:ring-pk-text-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-pk-border pt-3">
                  <span className="text-[10px] font-mono text-pk-text-secondary">
                    {remainingEvs >= 0 ? `${remainingEvs} remaining` : "Over limit!"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] font-normal px-2"
                    onClick={() => {
                      const reset: Partial<Record<PokemonStat, number>> = {};
                      STAT_ORDER.forEach((s) => { reset[s] = 0; });
                      onUpdateEvs(reset);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <style>{`
          .ev-slider {
            accent-color: var(--pk-text-primary, #1a1a1a);
          }
          .ev-slider::-webkit-slider-track {
            height: 6px;
            border-radius: 3px;
            background: linear-gradient(to right, var(--pk-text-primary, #1a1a1a) 0%, var(--pk-text-primary, #1a1a1a) var(--ev-fill, 0%), var(--pk-muted-bg, #e5e7eb) var(--ev-fill, 0%), var(--pk-muted-bg, #e5e7eb) 100%);
          }
          .ev-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 2px;
            background: var(--pk-card-bg, #ffffff);
            cursor: pointer;
            border: 2px solid var(--pk-text-primary, #1a1a1a);
          }
          .ev-slider::-moz-range-track {
            height: 6px;
            border-radius: 3px;
            background: var(--pk-muted-bg, #e5e7eb);
          }
          .ev-slider::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 2px;
            background: var(--pk-card-bg, #ffffff);
            cursor: pointer;
            border: 2px solid var(--pk-text-primary, #1a1a1a);
          }
          .ev-slider::-moz-range-progress {
            height: 6px;
            border-radius: 3px;
            background: var(--pk-text-primary, #1a1a1a);
          }
        `}</style>

        {/* Right Column: Moveset */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
          <div className="border border-pk-border bg-pk-card-bg p-4">
            <MovesetEditor
              moves={moves}
              availableMoves={pokemon.moves}
              onChange={onUpdateMoves}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


