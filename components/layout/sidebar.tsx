"use client";

import { Users, Wrench, BarChart3, Settings, Code2 } from "lucide-react";
import Image from "next/image";
import synergyLogo from "@/assets/synergy_logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

const navItems: { path: string; label: string; icon: typeof Users }[] = [
  { path: "/", label: "Teams", icon: Users },
  { path: "/builder", label: "Builder", icon: Wrench },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-pk-border bg-pk-sidebar-bg">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 px-6 py-6">
        <div className="flex h-14 w-20 items-center justify-center">
          <Image src={synergyLogo} alt="Synergy" className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold leading-tight text-pk-text-primary">
            Synergy
          </span>
          <span className="text-[10px] font-normal tracking-widest text-pk-text-secondary">
            Team Builder
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => router.push(item.path)}
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
        <button
          type="button"
          className="flex w-full items-center gap-4 rounded-md px-3 py-2 text-left text-sm font-bold text-pk-text-secondary transition-colors hover:text-pk-text-primary"
        >
          <Code2 className="h-4 w-4 shrink-0" />
          <span>Github</span>
        </button>
      </div>
    </aside>
  );
}
