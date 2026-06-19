"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Sidebar, type ViewType } from "@/components/layout/sidebar";
import { TeamGrid } from "@/components/layout/team-grid";
import { FullPageEditor } from "@/components/editor/full-page-editor";
import { useTeam } from "@/hooks/use-team";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("team");
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const {
    team,
    updatePokemon,
    updateEvs,
    updateIvs,
    updateMoves,
  } = useTeam();

  const handleNavigate = (view: ViewType) => {
    setActiveView(view);
    if (view !== "editor") {
      setEditingSlot(null);
    }
  };

  const handleEditPokemon = (slot: number) => {
    setEditingSlot(slot);
    setActiveView("editor");
  };

  const editingMember = editingSlot !== null ? team.members[editingSlot - 1] : null;

  return (
    <div className="flex h-screen flex-col">
      <TopBar activeView={activeView} onNavigate={handleNavigate} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onNavigate={handleNavigate} />
        <main className="flex flex-1 flex-col overflow-auto bg-pk-card-bg">
          {activeView === "team" || (activeView === "editor" && !editingMember) ? (
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
          ) : activeView === "editor" && editingMember ? (
            <FullPageEditor
              member={editingMember}
              onBack={() => { setEditingSlot(null); setActiveView("team"); }}
              onUpdate={(updates) => {
                if (editingSlot !== null) updatePokemon(editingSlot, updates);
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
          ) : (
            <div className="flex flex-1 items-center justify-center text-pk-text-secondary">
              Select a view from the sidebar
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
