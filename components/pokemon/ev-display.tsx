import type { PokemonStat } from "@/types/pokemon";

interface EvDisplayProps {
  evs: Record<PokemonStat, number>;
}

const STAT_ORDER: PokemonStat[] = ["hp", "atk", "def", "spa", "spd", "spe"];

export function EvDisplay({ evs }: EvDisplayProps) {
  const nonZero = STAT_ORDER.filter((s) => evs[s] > 0)
    .map((s) => `${evs[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`)
    .join(" / ");

  if (!nonZero) return <span className="text-xs text-pk-text-secondary">No EVs</span>;

  return (
    <span className="font-mono text-sm tracking-tight text-pk-text-primary">
      {nonZero}
    </span>
  );
}
