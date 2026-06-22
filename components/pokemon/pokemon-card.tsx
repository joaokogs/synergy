"use client";

import { useEffect, useState, useRef } from "react";
import type { TeamPokemon } from "@/types/pokemon";
import type { PokemonType } from "@/types/pokemon";
import { PokemonSprite } from "./pokemon-sprite";
import { TypeBadge } from "./type-badge";
import { TypeIcon } from "./type-icon";
import { CategoryIcon } from "./category-icon";
import { EvDisplay } from "./ev-display";
import { X } from "lucide-react";
import { getItemDisplayName, getItemData, getItemSpriteUrl, getAbilityData } from "@/lib/pokeapi";
import { getMoveData, type MoveInfo, type AbilityInfo } from "@/lib/pokeapi";
import { TYPE_COLORS } from "@/lib/type-utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PokemonCardProps {
  member: TeamPokemon;
  onEdit: () => void;
  onRemove: () => void;
}

function CardMoveBadge({ moveName }: { moveName: string | null }) {
  const [move, setMove] = useState<MoveInfo | null>(null);
  const [open, setOpen] = useState(false);
  const fetchingRef = useRef<string | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (moveName) {
      fetchingRef.current = moveName;
      getMoveData(moveName).then((data) => {
        if (fetchingRef.current === moveName) setMove(data);
      });
    }
  }, [moveName]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  const moveType = (move?.type ?? "normal") as PokemonType;
  const typeColor = TYPE_COLORS[moveType] ?? "#A8A77A";

  const handleMouseEnter = () => {
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setOpen(true), 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 200);
  };

  if (!moveName) {
    return (
      <div className="flex items-center gap-2 border border-pk-border bg-pk-muted-bg px-3 py-2">
        <span className="w-3 shrink-0 text-[10px] font-bold text-pk-text-secondary opacity-30">—</span>
        <span className="flex-1 text-xs text-pk-text-secondary opacity-50">Move</span>
      </div>
    );
  }

  const displayName = move?.displayName ?? moveName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="w-full focus-visible:outline-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative flex items-center justify-center border border-pk-border bg-pk-muted-bg px-3 py-2"
          style={{ borderLeftColor: typeColor, borderLeftWidth: 3 }}
        >
          <TypeIcon type={moveType} size={14} className="absolute left-2 shrink-0" />
          <span className="truncate text-xs font-semibold text-pk-text-primary">
            {displayName}
          </span>
        </div>
      </PopoverTrigger>
      {move && (
        <PopoverContent
          side="top"
          align="center"
          sideOffset={6}
          className="w-72"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <TypeIcon type={moveType} size={18} />
            <div>
              <p className="text-sm font-bold text-foreground">{move.displayName}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {move.type} · {move.category === "physical" ? "Physical" : move.category === "special" ? "Special" : "Status"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {move.power != null && (
              <div className="text-center">
                <p className="font-bold text-foreground">{move.power}</p>
                <p className="text-[10px] text-muted-foreground">Power</p>
              </div>
            )}
            <div className="text-center">
              <p className="font-bold text-foreground">{move.ppMax}</p>
              <p className="text-[10px] text-muted-foreground">PP</p>
            </div>
            {move.accuracy != null && (
              <div className="text-center">
                <p className="font-bold text-foreground">{move.accuracy === 0 ? "—" : `${move.accuracy}%`}</p>
                <p className="text-[10px] text-muted-foreground">Accuracy</p>
              </div>
            )}
          </div>
          {move.effect && (
            <p className="text-xs leading-relaxed text-muted-foreground border-t border-border pt-2">
              {move.effect}
            </p>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}

function ItemHoverBadge({ itemName }: { itemName: string | null }) {
  const [detail, setDetail] = useState<{ displayName: string; effect: string | null } | null>(null);
  const [open, setOpen] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (itemName) {
      getItemData(itemName).then((data) => {
        if (data) setDetail({ displayName: data.displayName, effect: data.effect });
      });
    }
  }, [itemName]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  if (!itemName) return <span className="flex items-center truncate text-sm font-semibold text-pk-text-primary w-full min-h-[28px] py-0.5">—</span>;

  const handleMouseEnter = () => {
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setOpen(true), 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="w-full text-left focus-visible:outline-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-pk-text-primary w-full min-h-[28px]">
          <img
            src={getItemSpriteUrl(itemName)}
            alt=""
            className="h-7 w-7 shrink-0 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="truncate">{detail?.displayName ?? getItemDisplayName(itemName)}</span>
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={6}
        className="w-72"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <img
            src={getItemSpriteUrl(itemName)}
            alt=""
            className="h-6 w-6 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <p className="text-sm font-bold text-foreground">
            {detail?.displayName ?? getItemDisplayName(itemName)}
          </p>
        </div>
        {detail?.effect && (
          <p className="text-xs leading-relaxed text-muted-foreground pt-2">
            {detail.effect}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

function AbilityHoverBadge({ abilityName }: { abilityName: string | null }) {
  const [detail, setDetail] = useState<AbilityInfo | null>(null);
  const [open, setOpen] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (abilityName) {
      getAbilityData(abilityName).then(setDetail);
    }
  }, [abilityName]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  if (!abilityName) return <span className="flex items-center truncate text-sm font-semibold text-pk-text-primary w-full min-h-[28px] py-0.5">—</span>;

  const displayName = detail?.displayName ?? abilityName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const handleMouseEnter = () => {
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setOpen(true), 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="w-full text-left focus-visible:outline-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="flex items-center truncate text-sm font-semibold text-pk-text-primary w-full min-h-[28px] py-0.5">
          {displayName}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={6}
        className="w-72"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="border-b border-border pb-2">
          <p className="text-sm font-bold text-foreground">{displayName}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Ability</p>
        </div>
        {detail?.effect && (
          <p className="text-xs leading-relaxed text-muted-foreground pt-2">
            {detail.effect}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function PokemonCard({ member, onEdit, onRemove }: PokemonCardProps) {
  const { pokemon, ability, item, moves, evs, gender, activeForm } = member;
  const displayName = pokemon.displayName;
  const spriteUrl = activeForm?.spriteUrl
    ?? (gender === "female" && pokemon.spriteFemaleUrl
      ? pokemon.spriteFemaleUrl
      : undefined);

  return (
    <div className="relative flex flex-col gap-2 border border-pk-border bg-pk-card-bg p-3 md:p-4">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center text-pk-text-secondary transition-colors hover:text-red-600"
        aria-label="Remove Pokémon"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="flex w-full cursor-pointer items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pk-text-primary"
      >
        <PokemonSprite
          id={pokemon.id}
          size={56}
          gender={gender}
          spriteUrl={spriteUrl}
          className="shrink-0 rounded-lg border-2 border-pk-border shadow-sm"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-pk-text-secondary">
              #{String(pokemon.id).padStart(3, "0")}
            </span>
            <h3 className="text-base font-bold leading-tight text-pk-text-primary truncate">
              {displayName}
            </h3>
          </div>

          <div className="flex flex-wrap gap-1">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} className="text-[10px] px-2 py-0.5" />
            ))}
          </div>
        </div>
      </button>

      <div className="flex gap-4 border-t border-pk-border pt-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-pk-text-secondary mb-0.5">
            Item
          </p>
          <ItemHoverBadge itemName={item} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-pk-text-secondary mb-0.5">
            Ability
          </p>
          <AbilityHoverBadge abilityName={ability} />
        </div>
      </div>

      <div className="border-t border-pk-border pt-2">
        <div className="grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <CardMoveBadge key={i} moveName={moves[i]} />
          ))}
        </div>
      </div>

      <div className="border-t border-pk-border pt-2">
        <EvDisplay evs={evs} />
      </div>
    </div>
  );
}
