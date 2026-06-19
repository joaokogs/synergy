import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Team, TeamPokemon, PokemonBase, PokemonStat } from "@/types/pokemon";

function defaultTeam(): Team {
  return {
    name: "My Team",
    format: "VGC 2025",
    members: Array(6).fill(null),
  };
}

function defaultIvs(): Record<PokemonStat, number> {
  return { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
}

function defaultEvs(): Record<PokemonStat, number> {
  return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

interface TeamState {
  team: Team;
  activeSlot: number;
  setActiveSlot: (slot: number) => void;
  addPokemon: (pokemon: PokemonBase) => void;
  removePokemon: (slot: number) => void;
  updatePokemon: (slot: number, updates: Partial<TeamPokemon>) => void;
  updateEvs: (slot: number, evs: Partial<Record<PokemonStat, number>>) => void;
  updateIvs: (slot: number, ivs: Partial<Record<PokemonStat, number>>) => void;
  updateMoves: (slot: number, moves: (string | null)[]) => void;
  renameTeam: (name: string) => void;
  resetTeam: () => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      team: defaultTeam(),
      activeSlot: 1,

      setActiveSlot: (slot) => set({ activeSlot: slot }),

      addPokemon: (pokemon) =>
        set((state) => {
          const members = [...state.team.members];
          const emptyIndex = members.findIndex((m) => m === null);
          if (emptyIndex === -1) return state;
          const slot = emptyIndex + 1;
          members[emptyIndex] = {
            slot,
            pokemon,
            item: null,
            ability: pokemon.abilities[0] ?? null,
            teraType: pokemon.types[0] ?? null,
            moves: [null, null, null, null],
            ivs: defaultIvs(),
            evs: defaultEvs(),
            nature: null,
          };
          return { team: { ...state.team, members } };
        }),

      removePokemon: (slot) =>
        set((state) => {
          let members = [...state.team.members];
          members[slot - 1] = null;
          const filled = members.filter((m): m is TeamPokemon => m !== null);
          const compacted: (TeamPokemon | null)[] = filled.map((m, i) => ({
            ...m,
            slot: i + 1,
          }));
          while (compacted.length < 6) {
            compacted.push(null);
          }
          return { team: { ...state.team, members: compacted } };
        }),

      updatePokemon: (slot, updates) =>
        set((state) => {
          const members = [...state.team.members];
          const member = members[slot - 1];
          if (member) {
            members[slot - 1] = { ...member, ...updates };
          }
          return { team: { ...state.team, members } };
        }),

      updateEvs: (slot, evs) =>
        set((state) => {
          const members = [...state.team.members];
          const member = members[slot - 1];
          if (member) {
            const newEvs = { ...member.evs, ...evs };
            const newTotal = Object.values(newEvs).reduce((a, b) => a + b, 0);
            if (newTotal <= 510) {
              members[slot - 1] = { ...member, evs: newEvs };
            }
          }
          return { team: { ...state.team, members } };
        }),

      updateIvs: (slot, ivs) =>
        set((state) => {
          const members = [...state.team.members];
          const member = members[slot - 1];
          if (member) {
            members[slot - 1] = {
              ...member,
              ivs: { ...member.ivs, ...ivs },
            };
          }
          return { team: { ...state.team, members } };
        }),

      updateMoves: (slot, moves) =>
        set((state) => {
          const members = [...state.team.members];
          const member = members[slot - 1];
          if (member) {
            members[slot - 1] = { ...member, moves };
          }
          return { team: { ...state.team, members } };
        }),

      renameTeam: (name) =>
        set((state) => ({
          team: { ...state.team, name },
        })),

      resetTeam: () => set({ team: defaultTeam() }),
    }),
    { name: "poke-builder-team" }
  )
);
