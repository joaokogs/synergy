"use client";

import { useEffect, useState, useRef } from "react";
import { getMoveData, type MoveInfo } from "@/lib/pokeapi";
import { TYPE_COLORS } from "@/lib/type-utils";
import { TypeIcon } from "./type-icon";
import { CategoryIcon } from "./category-icon";

interface MoveBadgeProps {
  moveName: string | null;
  slot?: number;
  size?: "sm" | "md";
}

export function MoveBadge({ moveName, slot, size = "md" }: MoveBadgeProps) {
  const [move, setMove] = useState<MoveInfo | null>(null);
  const fetchingRef = useRef<string | null>(null);

  useEffect(() => {
    if (moveName) {
      fetchingRef.current = moveName;
      getMoveData(moveName).then((data) => {
        if (fetchingRef.current === moveName) {
          setMove(data);
        }
      });
    }
  }, [moveName]);

  if (!moveName) {
    const h = size === "md" ? "h-11" : "h-9";
    return (
      <div
        className={`flex ${h} items-center rounded-lg border-2 border-dashed border-pk-border bg-pk-card-bg/50 px-3 text-sm text-pk-text-secondary`}
      >
        {slot ? `Move ${slot}` : "—"}
      </div>
    );
  }

  const moveType = move?.type ?? "normal";
  const typeColor = TYPE_COLORS[moveType] ?? "#A8A77A";

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg px-3 ${
        size === "md" ? "py-2.5" : "py-1.5"
      } text-sm font-medium shadow-sm transition-all hover:shadow-md`}
      style={{
        backgroundColor: `${typeColor}15`,
        borderLeft: `4px solid ${typeColor}`,
      }}
    >
      {move ? (
        <>
          <TypeIcon type={moveType} size={22} className="shrink-0" />

          <span className="flex-1 truncate text-pk-text-primary text-sm font-semibold">
            {move.displayName}
          </span>

          <div className="flex shrink-0 items-center gap-2">
            {move.category !== "status" && move.power != null && (
              <span
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-xs font-bold"
                style={{ backgroundColor: `${typeColor}25`, color: typeColor }}
              >
                {move.power}
              </span>
            )}

            {move.ppMax != null && (
              <span className="font-mono text-xs text-pk-text-secondary">
                {move.ppMax}
              </span>
            )}

            <CategoryIcon category={move.category} />
          </div>
        </>
      ) : (
        <span className="truncate text-pk-text-secondary">
          {moveName
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      )}
    </div>
  );
}
