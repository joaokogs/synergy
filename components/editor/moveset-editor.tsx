"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPE_COLORS } from "@/lib/type-utils";
import { TypeIcon } from "@/components/pokemon/type-icon";
import { CategoryIcon } from "@/components/pokemon/category-icon";
import { getMoveData, type MoveInfo } from "@/lib/pokeapi";
import type { PokemonType } from "@/types/pokemon";

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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (activeSlot !== null) {
      inputRefs.current[activeSlot]?.focus();
    }
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
      setSearchQuery("");
    },
    [activeSlot, moves, onChange]
  );

  const handleSlotClick = (slot: number) => {
    if (activeSlot === slot) return;
    setActiveSlot(slot);
    setSearchQuery("");
  };

  const handleInputChange = (slot: number, value: string) => {
    setActiveSlot(slot);
    setSearchQuery(value);
    if (!value.trim()) {
      const newMoves = [...moves];
      newMoves[slot] = null;
      onChange(newMoves);
    }
  };

  const clearSlot = (slot: number) => {
    const newMoves = [...moves];
    newMoves[slot] = null;
    onChange(newMoves);
    if (activeSlot === slot) setSearchQuery("");
  };

  const filled = moves.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-pk-text-secondary">
          Golpes
        </p>
        <span className="text-sm text-pk-text-secondary">{filled}/4</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((slot) => (
          <MoveSlotInput
            key={slot}
            slot={slot}
            moveName={moves[slot]}
            isActive={activeSlot === slot}
            searchQuery={activeSlot === slot ? searchQuery : ""}
            onClick={() => handleSlotClick(slot)}
            onChange={(value) => handleInputChange(slot, value)}
            onClear={() => clearSlot(slot)}
            inputRef={(el) => {
              inputRefs.current[slot] = el;
            }}
          />
        ))}
      </div>

      {activeSlot !== null && searchQuery.trim() && (
        <div className="rounded-xl border border-pk-border bg-pk-card-bg shadow-lg">
          {filteredMoves.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-sm text-pk-text-secondary">
              <Search className="h-8 w-8 opacity-40" />
              <span>Nenhum golpe para &ldquo;{searchQuery}&rdquo;</span>
            </div>
          ) : (
            <div className="max-h-[300px] divide-y divide-pk-border overflow-y-auto">
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
        </div>
      )}

      {activeSlot !== null && !searchQuery.trim() && (
        <div className="rounded-xl border-2 border-dashed border-pk-border p-6 text-center text-sm text-pk-text-secondary">
          Digite o nome do golpe para buscar
        </div>
      )}
    </div>
  );
}

// ─── Move Slot Input ─────────────────────────────────

function MoveSlotInput({
  slot,
  moveName,
  isActive,
  searchQuery,
  onClick,
  onChange,
  onClear,
  inputRef,
}: {
  slot: number;
  moveName: string | null;
  isActive: boolean;
  searchQuery: string;
  onClick: () => void;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
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

  // Se tem golpe, mostra badge com nome bonito. Input só em slot vazio ativo.
  const showFilled = !!(moveName && moveData);
  const showEmptyInput = !moveName && isActive;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 transition-all",
        showEmptyInput
          ? "border-pk-text-primary bg-pk-card-bg shadow-md ring-1 ring-pk-text-primary/10 cursor-text"
          : showFilled
            ? "bg-pk-card-bg cursor-default"
            : "border-dashed border-pk-border bg-pk-card-bg/60 hover:border-pk-text-primary/40 cursor-pointer"
      )}
      style={
        showFilled
          ? { borderColor: typeColor, backgroundColor: `${typeColor}08` }
          : undefined
      }
      onClick={!showFilled ? onClick : undefined}
    >
      {/* Icon do tipo / número do slot */}
      {showFilled ? (
        <TypeIcon type={moveType} size={20} className="shrink-0" />
      ) : (
        <span className="text-xs font-bold text-pk-text-secondary opacity-30 w-5 text-center shrink-0">
          {slot + 1}
        </span>
      )}

      {/* Input / Nome */}
      {showEmptyInput ? (
        <input
          ref={inputRef}
          placeholder={`Buscar golpe ${slot + 1}...`}
          value={searchQuery}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium outline-none text-pk-text-primary placeholder:text-pk-text-secondary/40"
        />
      ) : showFilled ? (
        <span className="flex-1 truncate text-sm font-semibold text-pk-text-primary">
          {moveData?.displayName ?? ""}
        </span>
      ) : (
        <span className="flex-1 text-sm text-pk-text-secondary/50">{`Golpe ${slot + 1}`}</span>
      )}

      {/* Botão limpar (só quando preenchido) */}
      {showFilled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="flex h-5 w-5 items-center justify-center rounded-full text-pk-text-secondary opacity-50 transition-all hover:opacity-100 hover:bg-pk-sidebar-bg"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
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

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-pk-sidebar-bg",
        isCurrentSlot && "bg-pk-sidebar-bg"
      )}
      onClick={onClick}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${typeColor}20` }}
      >
        <TypeIcon type={type} size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-pk-text-primary truncate">
          {displayName}
        </span>
        <span
          className="block text-[11px] font-bold uppercase leading-tight"
          style={{ color: typeColor }}
        >
          {type}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 text-xs text-pk-text-secondary">
        {category !== "status" && moveData?.power != null && (
          <span className="inline-flex items-center gap-1 rounded-md bg-pk-sidebar-bg px-2 py-1 font-mono font-bold">
            {moveData.power}
          </span>
        )}
        {moveData?.ppMax != null && (
          <span className="font-mono opacity-70">{moveData.ppMax}</span>
        )}
        <CategoryIcon category={category} />
      </div>

      {isSelected && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pk-text-primary">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
      )}
    </button>
  );
}
