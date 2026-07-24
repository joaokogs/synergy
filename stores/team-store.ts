import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Team, TeamPokemon, PokemonBase, PokemonStat } from "@/types/pokemon";
import { getFormPokemonData } from "@/lib/pokeapi";

let nextId = 1;
function generateId(): string {
  return `team_${nextId++}_${Date.now()}`;
}

function defaultTeam(name = "My Team"): Team {
  return {
    id: generateId(),
    name,
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

function updateTeamInList(teams: Team[], teamId: string, updater: (team: Team) => Team): Team[] {
  return teams.map((t) => (t.id === teamId ? updater(t) : t));
}

interface TeamState {
  teams: Team[];
  activeTeamId: string;
  activeSlot: number;
  setActiveSlot: (slot: number) => void;
  addPokemon: (pokemon: PokemonBase) => void;
  removePokemon: (slot: number) => void;
  updatePokemon: (slot: number, updates: Partial<TeamPokemon>) => void;
  updateEvs: (slot: number, evs: Partial<Record<PokemonStat, number>>) => void;
  updateIvs: (slot: number, ivs: Partial<Record<PokemonStat, number>>) => void;
  updateMoves: (slot: number, moves: (string | null)[]) => void;
  renameTeam: (teamId: string, name: string) => void;
  resetTeam: () => void;
  updateGender: (slot: number, gender: "male" | "female") => void;
  switchForm: (slot: number, formName: string) => Promise<void>;
  createTeam: (name?: string) => string;
  deleteTeam: (teamId: string) => void;
  duplicateTeam: (teamId: string) => void;
  setActiveTeam: (teamId: string) => void;
}

const defaultTeams = [defaultTeam()];

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      teams: defaultTeams,
      activeTeamId: defaultTeams[0].id,
      activeSlot: 1,

      setActiveSlot: (slot) => set({ activeSlot: slot }),

      setActiveTeam: (teamId) =>
        set((state) => {
          const exists = state.teams.some((t) => t.id === teamId);
          return exists ? { activeTeamId: teamId } : state;
        }),

      createTeam: (name) => {
        const team = defaultTeam(name);
        set((state) => ({
          teams: [...state.teams, team],
          activeTeamId: team.id,
        }));
        return team.id;
      },

      deleteTeam: (teamId) =>
        set((state) => {
          if (state.teams.length <= 1) return state;
          const filtered = state.teams.filter((t) => t.id !== teamId);
          const wasActive = state.activeTeamId === teamId;
          return {
            teams: filtered,
            activeTeamId: wasActive ? filtered[0].id : state.activeTeamId,
          };
        }),

      duplicateTeam: (teamId) =>
        set((state) => {
          const source = state.teams.find((t) => t.id === teamId);
          if (!source) return state;
          const clone: Team = {
            ...source,
            id: generateId(),
            name: `${source.name} (copy)`,
            members: source.members.map((m) =>
              m ? { ...m, slot: m.slot } : null
            ),
          };
          return { teams: [...state.teams, clone] };
        }),

      addPokemon: (pokemon) =>
        set((state) => {
          const team = state.teams.find((t) => t.id === state.activeTeamId);
          if (!team) return state;
          const members = [...team.members];
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
          return { teams: updateTeamInList(state.teams, state.activeTeamId, (t) => ({ ...t, members })) };
        }),

      removePokemon: (slot) =>
        set((state) => {
          const team = state.teams.find((t) => t.id === state.activeTeamId);
          if (!team) return state;
          const members = [...team.members];
          members[slot - 1] = null;
          const filled = members.filter((m): m is TeamPokemon => m !== null);
          const compacted: (TeamPokemon | null)[] = filled.map((m, i) => ({
            ...m,
            slot: i + 1,
          }));
          while (compacted.length < 6) {
            compacted.push(null);
          }
          return { teams: updateTeamInList(state.teams, state.activeTeamId, (t) => ({ ...t, members: compacted })) };
        }),

      updatePokemon: (slot, updates) =>
        set((state) => {
          const team = state.teams.find((t) => t.id === state.activeTeamId);
          if (!team) return state;
          const members = [...team.members];
          const member = members[slot - 1];
          if (member) {
            members[slot - 1] = { ...member, ...updates };
          }
          return { teams: updateTeamInList(state.teams, state.activeTeamId, (t) => ({ ...t, members })) };
        }),

      updateEvs: (slot, evs) =>
        set((state) => {
          const team = state.teams.find((t) => t.id === state.activeTeamId);
          if (!team) return state;
          const members = [...team.members];
          const member = members[slot - 1];
          if (member) {
            const newEvs = { ...member.evs, ...evs };
            const newTotal = Object.values(newEvs).reduce((a, b) => a + b, 0);
            if (newTotal <= 510) {
              members[slot - 1] = { ...member, evs: newEvs };
            }
          }
          return { teams: updateTeamInList(state.teams, state.activeTeamId, (t) => ({ ...t, members })) };
        }),

      updateIvs: (slot, ivs) =>
        set((state) => {
          const team = state.teams.find((t) => t.id === state.activeTeamId);
          if (!team) return state;
          const members = [...team.members];
          const member = members[slot - 1];
          if (member) {
            members[slot - 1] = {
              ...member,
              ivs: { ...member.ivs, ...ivs },
            };
          }
          return { teams: updateTeamInList(state.teams, state.activeTeamId, (t) => ({ ...t, members })) };
        }),

      updateMoves: (slot, moves) =>
        set((state) => {
          const team = state.teams.find((t) => t.id === state.activeTeamId);
          if (!team) return state;
          const members = [...team.members];
          const member = members[slot - 1];
          if (member) {
            members[slot - 1] = { ...member, moves };
          }
          return { teams: updateTeamInList(state.teams, state.activeTeamId, (t) => ({ ...t, members })) };
        }),

      updateGender: (slot, gender) =>
        set((state) => {
          const team = state.teams.find((t) => t.id === state.activeTeamId);
          if (!team) return state;
          const members = [...team.members];
          const member = members[slot - 1];
          if (member) {
            members[slot - 1] = { ...member, gender };
          }
          return { teams: updateTeamInList(state.teams, state.activeTeamId, (t) => ({ ...t, members })) };
        }),

      switchForm: async (slot, formName) => {
        const state = useTeamStore.getState();
        const team = state.teams.find((t) => t.id === state.activeTeamId);
        if (!team) return;
        const member = team.members[slot - 1];
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

        if (targetForm.cosmetic) {
          set({
            teams: updateTeamInList(state.teams, state.activeTeamId, (t) => ({
              ...t,
              members: t.members.map((m, i) =>
                i === slot - 1 && m
                  ? { ...m, gender: defaultGender, activeForm: targetForm }
                  : m
              ),
            })),
          });
          return;
        }

        const formData = await getFormPokemonData(formName);
        const currentState = useTeamStore.getState();
        const currentTeam = currentState.teams.find((t) => t.id === currentState.activeTeamId);
        if (!currentTeam) return;
        const currentMember = currentTeam.members[slot - 1];
        if (!currentMember) return;

        const formGender =
          formData.genderRate !== undefined && formData.genderRate >= 0
            ? ("male" as const)
            : undefined;

        set({
          teams: updateTeamInList(currentState.teams, currentState.activeTeamId, (t) => ({
            ...t,
            members: t.members.map((m, i) =>
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
          })),
        });
      },

      renameTeam: (teamId, name) =>
        set((state) => ({
          teams: updateTeamInList(state.teams, teamId, (t) => ({ ...t, name })),
        })),

      resetTeam: () =>
        set((state) => ({
          teams: updateTeamInList(state.teams, state.activeTeamId, () => defaultTeam()),
        })),
    }),
    {
      name: "tap-teams",
      partialize: (state) => ({
        teams: state.teams,
        activeTeamId: state.activeTeamId,
        activeSlot: state.activeSlot,
      }),
    }
  )
);
