import type { PokemonType } from "@/types/pokemon";
import { cn } from "@/lib/utils";

interface TypeBadgeProps {
  type: PokemonType;
  className?: string;
}

const TYPE_CLASSES: Partial<Record<PokemonType, string>> = {
  normal: "bg-[#A8A77A]",
  fire: "bg-[#EE8130]",
  water: "bg-[#6390F0]",
  electric: "bg-[#F7D02C] text-black",
  grass: "bg-[#7AC74C]",
  ice: "bg-[#96D9D6] text-black",
  fighting: "bg-[#C22E28]",
  poison: "bg-[#A33EA1]",
  ground: "bg-[#E2BF65] text-black",
  flying: "bg-[#A98FF3]",
  psychic: "bg-[#F95587]",
  bug: "bg-[#A6B91A]",
  rock: "bg-[#B6A136]",
  ghost: "bg-[#735797]",
  dragon: "bg-[#6F35FC]",
  dark: "bg-[#705746]",
  steel: "bg-[#B7B7CE] text-black",
};

export function TypeBadge({ type, className }: TypeBadgeProps) {
  return (
    <span
      aria-label={`${type} type`}
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase leading-none text-white",
        TYPE_CLASSES[type] ?? "bg-black",
        className
      )}
    >
      {type}
    </span>
  );
}
