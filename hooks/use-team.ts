"use client";

import { useTeamStore } from "@/stores/team-store";

export function useTeam() {
  return useTeamStore();
}
