"use client";

import { useState } from "react";
import type { PokemonBase } from "@/types/pokemon";
import { PokemonCard } from "@/components/pokemon/pokemon-card";
import { PokemonCardEmpty } from "@/components/pokemon/pokemon-card-empty";
import { PokemonEditor } from "@/components/editor/pokemon-editor";
import { SearchCombobox } from "@/components/editor/search-combobox";
import { useTeam } from "@/hooks/use-team";

interface TeamGridProps {
  onEdit?: (slot: number) => void;
}

export function TeamGrid({ onEdit }: TeamGridProps) {
  const { team, addPokemon, removePokemon, updatePokemon, updateEvs, updateIvs, updateMoves } =
    useTeam();
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [addingSlot, setAddingSlot] = useState<number | null>(null);

  const handleAddPokemon = async (pokemon: PokemonBase) => {
    if (addingSlot !== null) {
      addPokemon(addingSlot, pokemon);
      setAddingSlot(null);
    }
  };

  const handleEdit = (slot: number) => {
    if (onEdit) {
      onEdit(slot);
    } else {
      setEditingSlot(slot);
    }
  };

  const member = editingSlot !== null ? team.members[editingSlot - 1] : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {team.members.map((member, index) => {
          const slot = index + 1;
          if (!member) {
            return (
              <PokemonCardEmpty
                key={`empty-${slot}`}
                slot={slot}
                onClick={() => setAddingSlot(slot)}
              />
            );
          }
          return (
            <PokemonCard
              key={`member-${slot}`}
              member={member}
              onEdit={() => handleEdit(slot)}
              onRemove={() => removePokemon(slot)}
            />
          );
        })}
      </div>

      <SearchCombobox
        open={addingSlot !== null}
        onOpenChange={(open) => {
          if (!open) setAddingSlot(null);
        }}
        onSelect={handleAddPokemon}
      />

      {member && (
        <PokemonEditor
          member={member}
          open={editingSlot !== null}
          onOpenChange={(open) => {
            if (!open) setEditingSlot(null);
          }}
          onUpdate={(updates) => {
            if (editingSlot !== null) {
              updatePokemon(editingSlot, updates);
            }
          }}
          onUpdateEvs={(evs) => {
            if (editingSlot !== null) updateEvs(editingSlot, evs);
          }}
          onUpdateIvs={(ivs) => {
            if (editingSlot !== null) updateIvs(editingSlot, ivs);
          }}
          onUpdateMoves={(moves) => {
            if (editingSlot !== null) updateMoves(editingSlot, moves);
          }}
        />
      )}
    </>
  );
}
