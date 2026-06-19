"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPE_COLORS } from "@/lib/type-utils";
import { TypeIcon } from "@/components/pokemon/type-icon";
import { CategoryIcon } from "@/components/pokemon/category-icon";
import { getMoveData, type MoveInfo } from "@/lib/pokeapi";
import type { PokemonType } from "@/types/pokemon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MovesetEditorProps {
  moves: (string | null)[];
  availableMoves: string[];
  onChange: (moves: (string | null)[]) => void;
}

export function MovesetEditor({
  moves,
  availableMoves,
  onChange,
}: MovesetEditorProps) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeSlot !== null) {
      searchInputRef.current?.focus();
    }
  }, [activeSlot]);

  useEffect(() => {
    if (activeSlot === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveSlot(null);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeSlot]);

  const filteredMoves = useMemo(
    () =>
      availableMoves
        .filter((m) => m.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 80),
    [availableMoves, searchQuery]
  );

  const selectMove = useCallback(
    (move: string) => {
      if (activeSlot === null) return;
      const otherSlot = moves.indexOf(move);
      const newMoves = [...moves];
      if (otherSlot !== -1 && otherSlot !== activeSlot)
        newMoves[otherSlot] = null;
      newMoves[activeSlot] = move;
      onChange(newMoves);
      setActiveSlot(null);
      setSearchQuery("");
    },
    [activeSlot, moves, onChange]
  );

  const handleSlotClick = (slot: number) => {
    if (activeSlot === slot) {
      setActiveSlot(null);
      setSearchQuery("");
      return;
    }
    setActiveSlot(slot);
    setSearchQuery("");
  };

  const clearSlot = (slot: number) => {
    const newMoves = [...moves];
    newMoves[slot] = null;
    onChange(newMoves);
    if (activeSlot === slot) setSearchQuery("");
  };

  const filled = moves.filter(Boolean).length;

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-pk-text-secondary">
          Golpes
        </p>
        <span className="text-sm text-pk-text-secondary">{filled}/4</span>
      </div>

      <div className="grid grid-cols-2 gap-1">
        {[0, 1, 2, 3].map((slot) => (
          <MoveSlotBadge
            key={slot}
            slot={slot}
            moveName={moves[slot]}
            isActive={activeSlot === slot}
            onClick={() => handleSlotClick(slot)}
            onClear={() => clearSlot(slot)}
          />
        ))}
      </div>

      {activeSlot !== null && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pk-text-secondary/50" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`Buscar golpe para slot ${activeSlot + 1}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-pk-border bg-pk-muted-bg py-2.5 pl-10 pr-4 text-sm text-pk-text-primary outline-none placeholder:text-pk-text-secondary/40 focus:ring-1 focus:ring-pk-text-primary"
            />
          </div>

          {searchQuery.trim() && (
            <>
              {filteredMoves.length === 0 && (
                <div className="border border-pk-border bg-pk-card-bg p-8 text-center text-sm text-pk-text-secondary shadow-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 opacity-40" />
                    <span>Nenhum golpe para &ldquo;{searchQuery}&rdquo;</span>
                  </div>
                </div>
              )}
              {filteredMoves.length > 0 && (
                <div className="max-h-[300px] space-y-1 overflow-y-auto">
                  {filteredMoves.map((move) => (
                    <MoveOption
                      key={move}
                      move={move}
                      isSelected={moves.includes(move)}
                      isCurrentSlot={moves[activeSlot] === move}
                      onClick={() => selectMove(move)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {!searchQuery.trim() && (
            <div className="border-2 border-dashed border-pk-border p-6 text-center text-sm text-pk-text-secondary">
              Digite o nome do golpe para buscar
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Move Slot Badge ─────────────────────────────────

function MoveSlotBadge({
  slot,
  moveName,
  isActive,
  onClick,
  onClear,
}: {
  slot: number;
  moveName: string | null;
  isActive: boolean;
  onClick: () => void;
  onClear: () => void;
}) {
  const [moveData, setMoveData] = useState<MoveInfo | null>(null);

  useEffect(() => {
    if (!moveName) return;
    let cancelled = false;
    getMoveData(moveName).then((data) => {
      if (!cancelled && data) setMoveData(data);
    });
    return () => {
      cancelled = true;
    };
  }, [moveName]);

  const moveType = moveData?.type ?? "normal";
  const typeColor = TYPE_COLORS[moveType] ?? "#A8A77A";
  const hasMove = !!(moveName && moveData);

  const displayName = moveData?.displayName ?? moveName?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (!hasMove) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 border border-pk-border bg-pk-muted-bg px-3 py-2.5 cursor-pointer transition-all",
          isActive && "ring-1 ring-pk-text-primary"
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      >
        <span className="w-3 shrink-0 text-[10px] font-bold text-pk-text-secondary opacity-30">
          —
        </span>
        <span className="flex-1 text-xs text-pk-text-secondary opacity-50">
          Move
        </span>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        render={<div />}
        nativeButton={false}
        openOnHover
        delay={300}
        closeDelay={200}
        className={cn(
          "relative flex items-center border border-pk-border bg-pk-muted-bg px-3 py-2.5 transition-all group",
          isActive && "ring-1 ring-pk-text-primary"
        )}
        style={{ borderLeftColor: typeColor, borderLeftWidth: 3 }}
      >
        <div
          className="flex flex-1 items-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onClick(); } }}
        >
          <TypeIcon type={moveType} size={14} className="absolute left-2 shrink-0" />
          <span className="flex-1 truncate text-center text-xs font-semibold text-pk-text-primary">
            {displayName}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute right-1 flex h-5 w-5 items-center justify-center rounded-full text-pk-text-secondary opacity-0 transition-all group-hover:opacity-50 hover:opacity-100 hover:bg-pk-sidebar-bg"
        >
          <X className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      {moveData && (
        <PopoverContent
          side="top"
          align="center"
          sideOffset={6}
          className="w-72 [&[data-slot=popover-content]]:rounded-none"
        >
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <TypeIcon type={moveType} size={18} />
            <div>
              <p className="text-sm font-bold text-foreground">{moveData.displayName}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {moveData.type} · {moveData.category === "physical" ? "Physical" : moveData.category === "special" ? "Special" : "Status"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 text-xs">
            {moveData.power != null && (
              <div className="text-center">
                <p className="font-bold text-foreground">{moveData.power}</p>
                <p className="text-[10px] text-muted-foreground">Power</p>
              </div>
            )}
            <div className="text-center">
              <p className="font-bold text-foreground">{moveData.ppMax}</p>
              <p className="text-[10px] text-muted-foreground">PP</p>
            </div>
            {moveData.accuracy != null && (
              <div className="text-center">
                <p className="font-bold text-foreground">{moveData.accuracy === 0 ? "—" : `${moveData.accuracy}%`}</p>
                <p className="text-[10px] text-muted-foreground">Accuracy</p>
              </div>
            )}
          </div>
          {moveData.effect && (
            <p className="border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">
              {moveData.effect}
            </p>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}

// ─── Move Option ─────────────────────────────────────

function MoveOption({
  move,
  isSelected,
  isCurrentSlot,
  onClick,
}: {
  move: string;
  isSelected: boolean;
  isCurrentSlot: boolean;
  onClick: () => void;
}) {
  const [moveData, setMoveData] = useState<MoveInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMoveData(move).then((data) => {
      if (!cancelled && data) setMoveData(data);
    });
    return () => {
      cancelled = true;
    };
  }, [move]);

  const type = (moveData?.type ?? "normal") as PokemonType;
  const category = moveData?.category ?? "status";
  const typeColor = TYPE_COLORS[type] ?? "#A8A77A";
  const displayName = move
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const triggerContent = (
    <>
      <TypeIcon type={type} size={18} className="shrink-0" />
      <span className="flex-1 truncate text-sm font-semibold text-pk-text-primary">
        {displayName}
      </span>
      <div className="flex shrink-0 items-center gap-2 text-xs text-pk-text-secondary">
        {category !== "status" && moveData?.power != null && (
          <span className="font-mono font-bold" style={{ color: typeColor }}>
            {moveData.power}
          </span>
        )}
        {moveData?.ppMax != null && (
          <span className="font-mono">{moveData.ppMax}</span>
        )}
        <CategoryIcon category={category} />
      </div>
      {isSelected && (
        <Check className="h-4 w-4 shrink-0 text-pk-text-primary" />
      )}
    </>
  );

  if (!moveData) {
    return (
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left border border-pk-border shadow-sm transition-all hover:shadow-md hover:bg-pk-sidebar-bg"
        onClick={onClick}
      >
        {triggerContent}
      </button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 text-left border border-pk-border shadow-sm transition-all hover:shadow-md hover:bg-pk-sidebar-bg",
              isCurrentSlot && "ring-1 ring-pk-text-primary"
            )}
            style={{ backgroundColor: `${typeColor}08`, borderLeft: `3px solid ${typeColor}` }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            {triggerContent}
          </button>
        )}
        nativeButton
        openOnHover
        delay={300}
        closeDelay={200}
      />
        <PopoverContent
          side="right"
          align="center"
          sideOffset={8}
          className="w-72 [&[data-slot=popover-content]]:rounded-none"
      >
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <TypeIcon type={type} size={18} />
          <div>
            <p className="text-sm font-bold text-foreground">{moveData.displayName}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {moveData.type} · {moveData.category === "physical" ? "Physical" : moveData.category === "special" ? "Special" : "Status"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2 text-xs">
          {moveData.power != null && (
            <div className="text-center">
              <p className="font-bold text-foreground">{moveData.power}</p>
              <p className="text-[10px] text-muted-foreground">Power</p>
            </div>
          )}
          <div className="text-center">
            <p className="font-bold text-foreground">{moveData.ppMax}</p>
            <p className="text-[10px] text-muted-foreground">PP</p>
          </div>
          {moveData.accuracy != null && (
            <div className="text-center">
              <p className="font-bold text-foreground">{moveData.accuracy === 0 ? "—" : `${moveData.accuracy}%`}</p>
              <p className="text-[10px] text-muted-foreground">Accuracy</p>
            </div>
          )}
        </div>
        {moveData.effect && (
          <p className="border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">
            {moveData.effect}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
