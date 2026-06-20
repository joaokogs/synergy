"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PokemonSprite } from "@/components/pokemon/pokemon-sprite";
import { TypeBadge } from "@/components/pokemon/type-badge";
import { MovesetEditor } from "./moveset-editor";
import { NatureSelector } from "./nature-selector";
import { AbilitySelector } from "./ability-selector";
import { EvEditor } from "./ev-editor";
import { IvEditor } from "./iv-editor";
import { StatSummary } from "./stat-summary";
import { ItemSelector } from "./item-selector";
import type { TeamPokemon, PokemonStat, PokemonType } from "@/types/pokemon";

interface PokemonEditorProps {
  member: TeamPokemon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<TeamPokemon>) => void;
  onUpdateEvs: (evs: Partial<Record<PokemonStat, number>>) => void;
  onUpdateIvs: (ivs: Partial<Record<PokemonStat, number>>) => void;
  onUpdateMoves: (moves: (string | null)[]) => void;
}

const TERA_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export function PokemonEditor({
  member,
  open,
  onOpenChange,
  onUpdate,
  onUpdateEvs,
  onUpdateIvs,
  onUpdateMoves,
}: PokemonEditorProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { pokemon, ability, item, teraType, moves, ivs, evs, nature, level = 50 } = member;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-full max-h-[85vh] min-h-[520px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Editar Pokémon
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2 flex flex-1 flex-col overflow-hidden">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1 text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="moves" className="flex-1 text-sm">
              Moves
            </TabsTrigger>
            <TabsTrigger value="evs-ivs" className="flex-1 text-sm">
              EVs &amp; IVs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 overflow-y-auto space-y-6 pt-6">
            {/* Sprite à esquerda + campos à direita */}
            <div className="flex gap-8">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <PokemonSprite
                  id={pokemon.id}
                  size={120}
                  className="rounded-xl border-2 border-pk-border shadow-sm"
                />
                <div className="text-center">
                  <h3 className="text-base font-bold text-pk-text-primary leading-tight">
                    {pokemon.displayName}
                  </h3>
                  <div className="mt-1 flex flex-wrap justify-center gap-1">
                    {pokemon.types.map((t) => (
                      <TypeBadge key={t} type={t} className="text-[10px] px-2" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-pk-text-secondary">
                  Ability
                </label>
              <AbilitySelector
                abilities={pokemon.abilities}
                value={ability}
                onChange={(v) => onUpdate({ ability: v })}
              />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-pk-text-secondary">
                  Item
                </label>
                <ItemSelector
                  value={item}
                  onChange={(v) => onUpdate({ item: v })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-pk-text-secondary">
                  Tera Type
                </label>
                <Select
                  value={teraType ?? ""}
                  onValueChange={(v) =>
                    onUpdate({ teraType: (v || null) as PokemonType | null })
                  }
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select tera type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TERA_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="text-sm">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-pk-text-secondary">
                  Nature
                </label>
                <NatureSelector
                  value={nature}
                  onChange={(v) => onUpdate({ nature: v })}
                />
              </div>
            </div>
            </div>

            <div className="border-t border-pk-border pt-4">
              <StatSummary
                baseStats={pokemon.baseStats}
                ivs={ivs}
                evs={evs}
                nature={nature}
                level={level}
              />
            </div>
          </TabsContent>

          <TabsContent value="moves" className="flex-1 overflow-y-auto pt-6">
            <MovesetEditor
              moves={moves}
              availableMoves={pokemon.moves}
              onChange={onUpdateMoves}
            />
          </TabsContent>

          <TabsContent value="evs-ivs" className="flex-1 overflow-y-auto space-y-6 pt-6">
            <EvEditor evs={evs} onChange={onUpdateEvs} />
            <div className="border-t border-pk-border pt-5">
              <IvEditor ivs={ivs} onChange={onUpdateIvs} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
