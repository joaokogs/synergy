"use client";

import { useMemo } from "react";
import { useTeamStore } from "@/stores/team-store";

export function useTeam() {
  const teams = useTeamStore((s) => s.teams);
  const activeTeamId = useTeamStore((s) => s.activeTeamId);
  const activeSlot = useTeamStore((s) => s.activeSlot);
  const setActiveSlot = useTeamStore((s) => s.setActiveSlot);
  const addPokemon = useTeamStore((s) => s.addPokemon);
  const removePokemon = useTeamStore((s) => s.removePokemon);
  const updatePokemon = useTeamStore((s) => s.updatePokemon);
  const updateEvs = useTeamStore((s) => s.updateEvs);
  const updateIvs = useTeamStore((s) => s.updateIvs);
  const updateMoves = useTeamStore((s) => s.updateMoves);
  const renameTeam = useTeamStore((s) => s.renameTeam);
  const resetTeam = useTeamStore((s) => s.resetTeam);
  const updateGender = useTeamStore((s) => s.updateGender);
  const switchForm = useTeamStore((s) => s.switchForm);
  const createTeam = useTeamStore((s) => s.createTeam);
  const deleteTeam = useTeamStore((s) => s.deleteTeam);
  const duplicateTeam = useTeamStore((s) => s.duplicateTeam);
  const setActiveTeam = useTeamStore((s) => s.setActiveTeam);

  const team = useMemo(
    () => teams.find((t) => t.id === activeTeamId) ?? teams[0],
    [teams, activeTeamId]
  );

  return {
    teams,
    activeTeamId,
    activeSlot,
    team,
    setActiveSlot,
    addPokemon,
    removePokemon,
    updatePokemon,
    updateEvs,
    updateIvs,
    updateMoves,
    renameTeam,
    resetTeam,
    updateGender,
    switchForm,
    createTeam,
    deleteTeam,
    duplicateTeam,
    setActiveTeam,
  };
}
