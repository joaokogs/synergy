"use client";

import { useRouter } from "next/navigation";
import { TeamGrid } from "@/components/layout/team-grid";
import { useTeam } from "@/hooks/use-team";

export default function TeamPage() {
  const router = useRouter();
  const { setActiveSlot } = useTeam();

  const handleEditPokemon = (slot: number) => {
    setActiveSlot(slot);
    router.push("/builder");
  };

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 md:mb-4 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold text-pk-text-primary">
            Team Builder
          </h1>
        </div>
        <TeamGrid onEdit={handleEditPokemon} />
      </div>
    </div>
  );
}
