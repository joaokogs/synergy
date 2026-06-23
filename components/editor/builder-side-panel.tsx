"use client";

import { useState, useEffect } from "react";
import { Zap, TrendingUp, ChevronDown, Plus, Pencil, Trash2, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpeedTierList } from "./speed-tier-list";
import { getPokemonBuilds, createBuild, updateBuild, deleteBuild, type BuildPokemon, type Tier, TIERS } from "@/lib/pokedex-config";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PokemonBase, PokemonStat, TeamPokemon } from "@/types/pokemon";

interface BuilderSidePanelProps {
  currentPokemon: PokemonBase;
  member: TeamPokemon;
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

export function BuilderSidePanel({ currentPokemon, member, onUpdate, onUpdateEvs, onUpdateIvs, onUpdateMoves }: BuilderSidePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("speed");
  const [selectedTier, setSelectedTier] = useState<Tier>("OverUsed");
  const [tierOpen, setTierOpen] = useState(false);
  const [builds, setBuilds] = useState<BuildPokemon[] | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "rename">("create");
  const [editBuild, setEditBuild] = useState<BuildPokemon | null>(null);
  const [buildName, setBuildName] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BuildPokemon | null>(null);

  const [saving, setSaving] = useState(false);

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

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditBuild(null);
    setBuildName("");
    setDialogOpen(true);
  };

  const openRenameDialog = (build: BuildPokemon, e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogMode("rename");
    setEditBuild(build);
    setBuildName(build.team ?? "");
    setDialogOpen(true);
  };

  const handleSaveBuild = async () => {
    if (!buildName.trim()) return;
    setSaving(true);

    const build: BuildPokemon = {
      pokemon: currentPokemon.name,
      tier: selectedTier,
      team: buildName.trim(),
      item: member.item,
      ability: member.ability,
      teraType: member.teraType,
      nature: member.nature,
      level: member.level,
      ivs: member.ivs,
      evs: member.evs,
      moves: member.moves,
    };

    if (dialogMode === "create") {
      const result = await createBuild(build);
      if (result.success) {
        setDialogOpen(false);
        getPokemonBuilds(currentPokemon.name, selectedTier).then(setBuilds);
      } else {
        alert(result.error);
      }
    } else {
      const result = await updateBuild(build, editBuild?.team);
      if (result.success) {
        setDialogOpen(false);
        getPokemonBuilds(currentPokemon.name, selectedTier).then(setBuilds);
      } else {
        alert(result.error);
      }
    }

    setSaving(false);
  };

  const openDeleteConfirm = (build: BuildPokemon, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(build);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const result = await deleteBuild(currentPokemon.name, deleteTarget.team ?? "");
    if (result.success) {
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      getPokemonBuilds(currentPokemon.name, selectedTier).then(setBuilds);
    } else {
      alert(result.error);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "popular", label: "Builds", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: "speed", label: "Speed", icon: <Zap className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
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

            {activeTab === "popular" && (
              <button
                type="button"
                onClick={openCreateDialog}
                className="ml-auto flex items-center gap-1 rounded-sm border border-pk-border bg-pk-muted-bg px-2 py-1 text-[10px] font-bold text-pk-text-primary transition-colors hover:border-pk-text-primary/40"
              >
                <Save className="h-3 w-3" />
                Salvar Build
              </button>
            )}
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
                  <button
                    type="button"
                    onClick={openCreateDialog}
                    className="mt-1 flex items-center gap-1 rounded-sm border border-pk-border bg-pk-muted-bg px-2.5 py-1 text-[10px] font-bold text-pk-text-primary transition-colors hover:border-pk-text-primary/40"
                  >
                    <Plus className="h-3 w-3" />
                    Criar Build
                  </button>
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
                          <div className="relative flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-pk-border bg-pk-muted-bg px-4 py-5 text-center transition-all hover:border-pk-text-primary/40 hover:bg-pk-hover-bg">
                            <button
                              type="button"
                              onClick={() => handleApply(build)}
                              className="flex w-full flex-col items-center justify-center gap-1.5"
                            >
                              <span className="text-sm font-bold text-pk-text-primary">
                                {formatName(build.team ?? "Build")}
                              </span>
                            </button>

                            <div className="absolute right-1.5 top-1.5 flex gap-0.5">
                              <button
                                type="button"
                                onClick={(e) => openRenameDialog(build, e)}
                                className="flex h-6 w-6 items-center justify-center rounded text-pk-text-secondary/50 transition-colors hover:bg-pk-hover-bg hover:text-pk-text-primary"
                                aria-label="Editar build"
                                title="Editar build"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => openDeleteConfirm(build, e)}
                                className="flex h-6 w-6 items-center justify-center rounded text-pk-text-secondary/50 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                aria-label="Excluir build"
                                title="Excluir build"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Salvar Build" : "Editar Build"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Dê um nome para salvar a configuração atual do Pokémon como build."
                : "Salvar a configuração atual do Pokémon nesta build."}
            </DialogDescription>
          </DialogHeader>

          <Input
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            placeholder="Ex: Choice Specs"
            onKeyDown={(e) => {
              if (e.key === "Enter" && buildName.trim() && !saving) {
                handleSaveBuild();
              }
            }}
            autoFocus
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveBuild} disabled={!buildName.trim() || saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {dialogMode === "create" ? "Salvar" : "Atualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Excluir Build</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a build <strong>{deleteTarget ? formatName(deleteTarget.team ?? "") : ""}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
