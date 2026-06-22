"use client";

import { Plus, X } from "lucide-react";
import { PokemonSprite } from "@/components/pokemon/pokemon-sprite";
import { cn } from "@/lib/utils";
import type { TeamPokemon } from "@/types/pokemon";

interface BuilderTabsProps {
  members: (TeamPokemon | null)[];
  activeSlot: number;
  onSelectSlot: (slot: number) => void;
  onRemoveSlot: (slot: number) => void;
}

function TabButton({
  slot,
  isActive,
  isEmpty,
  children,
  onClick,
}: {
  slot: number;
  isActive: boolean;
  isEmpty?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-1.5 px-2 py-2 text-xs font-medium transition-colors",
        "min-w-0 shrink-0 select-none",
        isActive
          ? "z-10 bg-pk-card-bg text-pk-text-primary"
          : "bg-transparent text-pk-text-secondary hover:bg-pk-hover-bg hover:text-pk-text-primary",
        isActive && "shadow-[-1px_0_2px_rgba(0,0,0,0.04),1px_0_2px_rgba(0,0,0,0.04)]",
        !isActive && "border-r border-pk-border"
      )}
      style={
        isActive
          ? {
              borderTop: "2px solid var(--color-primary, #3b82f6)",
              borderLeft: "1px solid var(--color-pk-border)",
              borderRight: "1px solid var(--color-pk-border)",
              borderBottom: "1px solid transparent",
              marginBottom: "-1px",
              borderTopLeftRadius: "6px",
              borderTopRightRadius: "6px",
            }
          : {
              borderTopLeftRadius: "4px",
              borderTopRightRadius: "4px",
            }
      }
    >
      {children}
    </button>
  );
}

export function BuilderTabs({ members, activeSlot, onSelectSlot, onRemoveSlot }: BuilderTabsProps) {
  const filled = members.filter((m): m is TeamPokemon => m !== null);
  const nextSlot = filled.length + 1;

  return (
    <div className="flex overflow-x-auto bg-pk-muted-bg border-b border-pk-border">
      <div className="flex">
        {filled.map((member) => {
          const slot = member.slot;
          const tabSpriteUrl = member.activeForm?.spriteUrl
            ?? (member.gender === "female" && member.pokemon.spriteFemaleUrl
              ? member.pokemon.spriteFemaleUrl
              : undefined);
          return (
            <TabButton
              key={slot}
              slot={slot}
              isActive={slot === activeSlot}
              onClick={() => onSelectSlot(slot)}
            >
              <span className="text-[10px] font-mono text-pk-text-secondary/60">{slot}</span>
              <PokemonSprite
                id={member.pokemon.id}
                size={16}
                gender={member.gender}
                spriteUrl={tabSpriteUrl}
                className="shrink-0 rounded-sm"
              />
              <span className="truncate max-w-[60px] sm:max-w-[100px]">
                {member.pokemon.displayName}
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSlot(slot);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveSlot(slot);
                  }
                }}
                className="ml-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm text-pk-text-secondary/50 opacity-0 transition-all hover:bg-pk-hover-bg hover:text-pk-text-primary group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                aria-label={`Remove ${member.pokemon.displayName}`}
              >
                <X className="h-3 w-3" />
              </span>
            </TabButton>
          );
        })}
        {nextSlot <= 6 && (
          <TabButton
            key="add"
            slot={nextSlot}
            isActive={false}
            onClick={() => onSelectSlot(nextSlot)}
          >
            <span className="text-[10px] font-mono text-pk-text-secondary/60">{nextSlot}</span>
            <span className="flex items-center gap-1 text-pk-text-secondary/70">
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">Empty</span>
            </span>
          </TabButton>
        )}
      </div>
    </div>
  );
}
