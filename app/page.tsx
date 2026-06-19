"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Sidebar, type ViewType } from "@/components/layout/sidebar";
import { TeamGrid } from "@/components/layout/team-grid";
import { BuilderView } from "@/components/builder/builder-view";
import { useTeam } from "@/hooks/use-team";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("team");
  const { setActiveSlot } = useTeam();

  const handleNavigate = (view: ViewType) => {
    setActiveView(view);
  };

  const handleEditPokemon = (slot: number) => {
    setActiveSlot(slot);
    setActiveView("editor");
  };

  return (
    <div className="flex h-screen flex-col">
      <TopBar activeView={activeView} onNavigate={handleNavigate} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onNavigate={handleNavigate} />
        <main className="flex flex-1 flex-col overflow-auto bg-pk-card-bg">
          {activeView === "team" ? (
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
          ) : activeView === "editor" ? (
            <BuilderView />
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
