"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTeam } from "@/hooks/use-team";
import { BuilderTabs } from "./builder-tabs";
import { FullPageEditor } from "@/components/editor/full-page-editor";
import { PokemonSearchDialog } from "@/components/editor/pokemon-search-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PokemonBase } from "@/types/pokemon";

export function BuilderView() {
  const {
    team,
    activeSlot,
    setActiveSlot,
    addPokemon,
    removePokemon,
    updatePokemon,
    updateEvs,
    updateIvs,
    updateMoves,
  } = useTeam();
  const [addingSlot, setAddingSlot] = useState<number | null>(null);
  const [removingSlot, setRemovingSlot] = useState<number | null>(null);

  const hasAnyPokemon = team.members.some((m) => m !== null);
  const removingMember = removingSlot !== null ? team.members[removingSlot - 1] : null;

  useEffect(() => {
    const member = team.members[activeSlot - 1];
    if (!member && hasAnyPokemon) {
      const firstFilled = team.members.findIndex((m) => m !== null);
      if (firstFilled !== -1) {
        setActiveSlot(firstFilled + 1);
      }
    }
  }, [team.members, activeSlot, setActiveSlot, hasAnyPokemon]);

  const handleSelectSlot = (slot: number) => {
    const member = team.members[slot - 1];
    if (member) {
      setActiveSlot(slot);
    } else {
      setAddingSlot(slot);
    }
  };

  if (!hasAnyPokemon) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className="flex flex-col items-center gap-2 text-pk-text-secondary">
          <Plus className="h-8 w-8" />
          <p className="text-sm">No Pokémon in your team yet.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddingSlot(1)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Add a Pokémon
        </button>
        <PokemonSearchDialog
          open={addingSlot !== null}
          onOpenChange={(open) => {
            if (!open) setAddingSlot(null);
          }}
          onSelect={(pokemon: PokemonBase) => {
            if (addingSlot !== null) {
              addPokemon(pokemon);
              setActiveSlot(addingSlot);
              setAddingSlot(null);
            }
          }}
        />
      </div>
    );
  }

  const member = team.members[activeSlot - 1];

  return (
    <div className="flex flex-1 flex-col">
      <BuilderTabs
        members={team.members}
        activeSlot={activeSlot}
        onSelectSlot={handleSelectSlot}
        onRemoveSlot={setRemovingSlot}
      />
      <div className="flex-1 overflow-hidden">
        {member ? (
          <FullPageEditor
            member={member}
            hideHeader
            onBack={() => {}}
            onUpdate={(updates) => updatePokemon(activeSlot, updates)}
            onUpdateEvs={(evs) => updateEvs(activeSlot, evs)}
            onUpdateIvs={(ivs) => updateIvs(activeSlot, ivs)}
            onUpdateMoves={(moves) => updateMoves(activeSlot, moves)}
          />
        ) : (
          <div className="flex h-full items-center justify-center flex-col gap-4 text-pk-text-secondary">
            <p className="text-sm">This slot is empty</p>
            <button
              type="button"
              onClick={() => setAddingSlot(activeSlot)}
              className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Add Pokémon
            </button>
          </div>
        )}
      </div>
      <PokemonSearchDialog
        open={addingSlot !== null}
        onOpenChange={(open) => {
          if (!open) setAddingSlot(null);
        }}
        onSelect={(pokemon: PokemonBase) => {
          if (addingSlot !== null) {
            addPokemon(pokemon);
            setActiveSlot(addingSlot);
            setAddingSlot(null);
          }
        }}
      />

      <Dialog open={removingSlot !== null} onOpenChange={(open) => { if (!open) setRemovingSlot(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Pokémon</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {removingMember?.pokemon.displayName}
              </span>{" "}
              from slot {removingSlot}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemovingSlot(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (removingSlot !== null) {
                  removePokemon(removingSlot);
                  setRemovingSlot(null);
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
