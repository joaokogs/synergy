import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Team, TeamPokemon, PokemonBase, PokemonStat } from "@/types/pokemon";
import { getFormPokemonData } from "@/lib/pokeapi";

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
  updateGender: (slot: number, gender: "male" | "female") => void;
  switchForm: (slot: number, formName: string) => Promise<void>;
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
          const defaultGender =
            pokemon.genderRate !== undefined && pokemon.genderRate >= 0
              ? ("male" as const)
              : undefined;
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
            level: 50,
            gender: defaultGender,
          };
          return { team: { ...state.team, members } };
        }),

      removePokemon: (slot) =>
        set((state) => {
          const members = [...state.team.members];
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

      updateGender: (slot, gender) =>
        set((state) => {
          const members = [...state.team.members];
          const member = members[slot - 1];
          if (member) {
            members[slot - 1] = { ...member, gender };
          }
          return { team: { ...state.team, members } };
        }),

      switchForm: async (slot, formName) => {
        const state = useTeamStore.getState();
        const member = state.team.members[slot - 1];
        if (!member) return;

        const targetForm = member.pokemon.forms?.find(
          (f) => f.name === formName
        );
        if (!targetForm) return;

        const defaultGender =
          member.pokemon.genderRate !== undefined &&
          member.pokemon.genderRate >= 0
            ? ("male" as const)
            : undefined;

        // Cosmetic form: just update sprite/activeForm
        if (targetForm.cosmetic) {
          set({
            team: {
              ...state.team,
              members: state.team.members.map((m, i) =>
                i === slot - 1 && m
                  ? { ...m, gender: defaultGender, activeForm: targetForm }
                  : m
              ),
            },
          });
          return;
        }

        // Species-level form: re-fetch pokemon data
        const formData = await getFormPokemonData(formName);
        const currentState = useTeamStore.getState();
        const currentMember = currentState.team.members[slot - 1];
        if (!currentMember) return;

        const formGender =
          formData.genderRate !== undefined && formData.genderRate >= 0
            ? ("male" as const)
            : undefined;

        set({
          team: {
            ...currentState.team,
            members: currentState.team.members.map((m, i) =>
              i === slot - 1 && m
                ? {
                    ...m,
                    pokemon: formData,
                    gender: formGender,
                    activeForm: {
                      name: formData.name,
                      displayName: formData.displayName,
                      spriteUrl: formData.spriteUrl,
                      id: formData.id,
                    },
                    ability: formData.abilities[0] ?? null,
                    teraType: formData.types[0] ?? null,
                  }
                : m
            ),
          },
        });
      },

      renameTeam: (name) =>
        set((state) => ({
          team: { ...state.team, name },
        })),

      resetTeam: () => set({ team: defaultTeam() }),
    }),
    { name: "synergy-team" }
  )
);
