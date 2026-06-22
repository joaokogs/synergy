"use client";

import { useState, useMemo } from "react";
import { useTeamStore } from "@/stores/team-store";
import { ALL_TYPES, getAbilityOverrides } from "@/lib/type-chart";
import { analyzeTeam } from "@/lib/analytics";
import { TYPE_COLORS } from "@/lib/type-utils";
import { TypeIcon } from "@/components/pokemon/type-icon";
import { PokemonSearchDialog } from "@/components/editor/pokemon-search-dialog";
import type { PokemonBase, TeamPokemon } from "@/types/pokemon";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Swords, Plus, X } from "lucide-react";

const CELL_CLASS: Record<string, string> = {
  "0": "bg-green-800 text-white",
  "0.25": "bg-green-600 text-white",
  "0.5": "bg-green-400 text-green-950",
  "1": "bg-pk-muted-bg text-pk-text-secondary/60",
  "2": "bg-red-400 text-red-950",
  "4": "bg-red-700 text-white",
};

function Cell({ m }: { m: number }) {
  const label =
    m === 0 ? "0" : m === 0.25 ? "¼" : m === 0.5 ? "½" : m === 1 ? "—" : `${m}×`;
  return (
    <div
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-[3px] text-[11px] font-bold leading-none",
        CELL_CLASS[m.toString()],
      )}
      title={`${m}×`}
    >
      {label}
    </div>
  );
}

function EmptyCell() {
  return <div className="h-7 w-7" />;
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[11px] text-pk-text-secondary">
      <span className="font-semibold text-pk-text-primary">Legend:</span>
      {[
        { label: "0", m: 0 },
        { label: "¼", m: 0.25 },
        { label: "½", m: 0.5 },
        { label: "1×", m: 1 },
        { label: "2×", m: 2 },
        { label: "4×", m: 4 },
      ].map(({ label, m }) => (
        <span key={label} className="flex items-center gap-1">
          <Cell m={m} />
          {label}
        </span>
      ))}
    </div>
  );
}

function displayAbilityName(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AnalyticsPage() {
  const team = useTeamStore((s) => s.team);
  const addPokemon = useTeamStore((s) => s.addPokemon);
  const removePokemon = useTeamStore((s) => s.removePokemon);
  const [searchOpen, setSearchOpen] = useState(false);
  const [abilityOverrides, setAbilityOverrides] = useState<Record<number, string>>({});

  const teamBySlot = useMemo(() => {
    const map = new Map<number, TeamPokemon>();
    for (const m of team.members) {
      if (m) map.set(m.slot, m);
    }
    return map;
  }, [team.members]);

  const analysis = useMemo(() => {
    const modified = team.members.map((m) => {
      if (!m) return null;
      const override = abilityOverrides[m.slot];
      if (override) return { ...m, ability: override };
      return m;
    });
    return analyzeTeam(modified);
  }, [team.members, abilityOverrides]);

  const analysisBySlot = new Map(analysis.members.map((m) => [m.slot, m]));

  const handleSelect = (pokemon: PokemonBase) => {
    addPokemon(pokemon);
  };

  return (
    <div className="flex h-full flex-col gap-3 p-5 pb-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Swords className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-base font-bold text-pk-text-primary">Type Analytics</h1>
          <p className="text-[11px] text-pk-text-secondary leading-tight">{team.name}</p>
        </div>
      </div>

      {!analysis.members.length ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-[13px] text-pk-text-secondary">
          <span>No Pokémon in your team.</span>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Pokémon
          </button>
        </div>
      ) : (
        <>
          <Legend />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-pk-border">
            <div className="flex shrink-0 border-b border-pk-border bg-pk-sidebar-bg">
              <div className="flex w-[88px] shrink-0 items-center gap-1.5 px-3 py-2">
                <Swords className="h-3 w-3 text-pk-text-secondary" />
                <span className="text-[10px] font-semibold text-pk-text-secondary uppercase tracking-wider">
                  Attack
                </span>
              </div>
              {[1, 2, 3, 4, 5, 6].map((slot) => {
                const member = analysisBySlot.get(slot);
                const teamMember = teamBySlot.get(slot);
                const abilities = teamMember?.pokemon.abilities ?? [];
                const currentAbility = abilityOverrides[slot] ?? teamMember?.ability ?? null;
                const hasAbilityEffect = abilities.some(
                  (a) => getAbilityOverrides(a).length > 0,
                );
                const showAbilities = abilities.length > 1 && hasAbilityEffect;

                return (
                  <div key={slot} className="group relative flex flex-1 flex-col items-center gap-1 border-l border-pk-border py-1.5">
                    {member ? (
                      <>
                        <button
                          type="button"
                          onClick={() => removePokemon(slot)}
                          className="absolute right-0.5 top-0.5 z-10 text-pk-text-secondary/50 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                          aria-label={`Remove ${member.displayName}`}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={member.spriteUrl} alt="" className="h-8 w-8 object-contain" />
                        {showAbilities && (
                          <Select
                            value={currentAbility ?? ""}
                            onValueChange={(v) =>
                              setAbilityOverrides((prev) => ({
                                ...prev,
                                [slot]: v as string,
                              }))
                            }
                          >
                            <SelectTrigger className="h-6 w-full max-w-[120px] rounded-md px-2 py-0 text-[10px] font-medium">
                              <SelectValue placeholder="Ability">
                                {displayAbilityName(currentAbility ?? "")}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {abilities.map((ability) => (
                                <SelectItem key={ability} value={ability} className="text-[12px] py-1.5">
                                  {displayAbilityName(ability)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {!showAbilities && (
                          <span className="text-[9px] font-medium text-pk-text-secondary leading-tight text-center px-1">
                            {displayAbilityName(currentAbility ?? "")}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-1 items-center">
                        <button
                          type="button"
                          onClick={() => setSearchOpen(true)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-pk-border text-pk-text-secondary transition-colors hover:border-pk-text-primary hover:text-pk-text-primary"
                          title="Add Pokémon"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex w-9 shrink-0 items-center justify-center border-l border-pk-border bg-red-50/50 dark:bg-red-950/20" title="Weakness count (2×/4×)">
                <span className="text-[11px] font-bold text-red-600 dark:text-red-400">W</span>
              </div>
              <div className="flex w-9 shrink-0 items-center justify-center border-l border-pk-border bg-green-50/50 dark:bg-green-950/20" title="Resistance count (½/¼/0)">
                <span className="text-[11px] font-bold text-green-600 dark:text-green-400">R</span>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {ALL_TYPES.map((attackType) => {
                const color = TYPE_COLORS[attackType];
                const weaknesses = analysis.members.filter((m) => m.multipliers[attackType] >= 2).length;
                const resistances = analysis.members.filter((m) => m.multipliers[attackType] < 1).length;
                return (
                  <div key={attackType} className="flex border-b border-pk-border last:border-b-0">
                    <div className="flex w-[88px] shrink-0 items-center gap-2 px-3 py-1">
                      <TypeIcon type={attackType} size={13} />
                      <span
                        className="text-[11px] font-bold capitalize leading-none"
                        style={{ color }}
                      >
                        {attackType}
                      </span>
                    </div>
                    {[1, 2, 3, 4, 5, 6].map((slot) => {
                      const member = analysisBySlot.get(slot);
                      return (
                        <div
                          key={slot}
                          className="flex flex-1 items-center justify-center border-l border-pk-border py-1"
                        >
                          {member ? <Cell m={member.multipliers[attackType]} /> : <EmptyCell />}
                        </div>
                      );
                    })}
                    <div className="flex w-9 shrink-0 items-center justify-center border-l border-pk-border py-1">
                      <div className={cn(
                        "flex h-7 w-7 items-center justify-center rounded text-[12px] font-bold",
                        weaknesses > 0
                          ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                          : "text-pk-text-secondary/40",
                      )}>
                        {weaknesses}
                      </div>
                    </div>
                    <div className="flex w-9 shrink-0 items-center justify-center border-l border-pk-border py-1">
                      <div className={cn(
                        "flex h-7 w-7 items-center justify-center rounded text-[12px] font-bold",
                        resistances > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                          : "text-pk-text-secondary/40",
                      )}>
                        {resistances}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <PokemonSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={handleSelect}
      />
    </div>
  );
}
