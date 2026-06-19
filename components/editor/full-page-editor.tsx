"use client";

import { ArrowLeft } from "lucide-react";
import { PokemonSprite } from "@/components/pokemon/pokemon-sprite";
import { TypeBadge } from "@/components/pokemon/type-badge";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemSelector } from "./item-selector";
import { NatureSelector } from "./nature-selector";
import { MovesetEditor } from "./moveset-editor";
import { UnifiedStats } from "./unified-stats";

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
                <NatureSelector
                  value={nature}
                  onChange={(v) => onUpdate({ nature: v })}
                />
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

        {/* Center Column: Unified Stats (Base + IV + EV + Nature + Final) */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
          <UnifiedStats
            baseStats={pokemon.baseStats}
            ivs={ivs}
            evs={evs}
            nature={nature}
            onUpdateIvs={onUpdateIvs}
            onUpdateEvs={onUpdateEvs}
          />
        </div>

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


