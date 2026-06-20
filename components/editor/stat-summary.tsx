import type { PokemonStat } from "@/types/pokemon";
import { calculateStat, getStatName, STAT_ORDER } from "@/lib/stat-calculator";

interface StatSummaryProps {
  baseStats: Record<PokemonStat, number>;
  ivs: Record<PokemonStat, number>;
  evs: Record<PokemonStat, number>;
  nature?: string | null;
  level?: number;
}

export function StatSummary({ baseStats, ivs, evs, nature = null, level = 50 }: StatSummaryProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-pk-text-secondary">
        Stats at Lv. {level}
      </p>
      <div className="space-y-1">
        {STAT_ORDER.map((stat) => {
          const calculated = calculateStat(
            baseStats[stat],
            ivs[stat],
            evs[stat],
            stat,
            level,
            nature
          );
          return (
            <div
              key={stat}
              className="flex items-center justify-between border-b border-pk-border py-1"
            >
              <span className="text-xs font-medium text-pk-text-secondary">
                {getStatName(stat)}
              </span>
              <div className="flex items-center gap-3">
                <span className="w-6 text-right text-xs text-pk-text-secondary">
                  {baseStats[stat]}
                </span>
                <span className="w-14 text-right text-sm font-mono font-bold text-pk-text-primary">
                  {calculated}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
