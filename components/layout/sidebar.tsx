"use client";

import { Swords, Users, Wrench, BookOpen, Settings, ExternalLink, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewType = "team" | "editor" | "resources" | "settings";

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const navItems: { id: ViewType; label: string; icon: typeof Users }[] = [
  { id: "team", label: "Teams", icon: Users },
  { id: "editor", label: "Builder", icon: Wrench },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-pk-border bg-pk-sidebar-bg">
      {/* Logo */}
      <div className="flex items-center gap-4 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center bg-black">
          <Swords className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold leading-tight text-pk-text-primary">
            Pro Builder
          </span>
          <span className="text-[10px] font-normal tracking-widest text-pk-text-secondary">
            VGC 2025
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex w-full items-center gap-4 rounded-md px-3 py-2.5 text-left text-sm font-bold tracking-wide transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-pk-text-secondary hover:bg-pk-hover-bg hover:text-pk-text-primary"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Export Button */}
      <div className="px-4 pb-4">
        <Button
          variant="default"
          className="w-full rounded-none text-xs font-bold tracking-wider"
          size="sm"
        >
          Export Team
        </Button>
      </div>

      {/* Bottom Links */}
      <div className="border-t border-pk-border px-4 py-4">
        <div className="space-y-1">
          <button
            type="button"
            className="flex w-full items-center gap-4 rounded-md px-3 py-2 text-left text-sm font-bold text-pk-text-secondary transition-colors hover:text-pk-text-primary"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span>Support</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-4 rounded-md px-3 py-2 text-left text-sm font-bold text-pk-text-secondary transition-colors hover:text-pk-text-primary"
          >
            <Code2 className="h-4 w-4 shrink-0" />
            <span>Github</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
