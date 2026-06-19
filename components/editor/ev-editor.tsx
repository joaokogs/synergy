"use client";

import type { PokemonStat } from "@/types/pokemon";
import { getStatName } from "@/lib/stat-calculator";

interface EvEditorProps {
  evs: Record<PokemonStat, number>;
  onChange: (evs: Partial<Record<PokemonStat, number>>) => void;
}

const STAT_ORDER: PokemonStat[] = ["hp", "atk", "def", "spa", "spd", "spe"];

export function EvEditor({ evs, onChange }: EvEditorProps) {
  const total = Object.values(evs).reduce((a, b) => a + b, 0);
  const remaining = 510 - total;

  const handleChange = (stat: PokemonStat, value: string) => {
    const num = Math.max(0, Math.min(252, parseInt(value) || 0));
    const currentTotal = total - evs[stat];
    if (currentTotal + num <= 510) {
      onChange({ [stat]: num });
    }
  };

  const clampValue = (stat: PokemonStat, delta: number) => {
    const currentTotal = total - evs[stat];
    const maxAllowed = Math.min(252, 510 - currentTotal);
    const newVal = Math.max(0, Math.min(maxAllowed, evs[stat] + delta));
    onChange({ [stat]: newVal });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-pk-text-secondary">
          EVs (Total: {total}/510)
        </p>
        <span
          className={`text-xs font-medium ${
            remaining < 0 ? "text-red-500" : "text-pk-text-secondary"
          }`}
        >
          {remaining} remaining
        </span>
      </div>

      <div className="space-y-2">
        {STAT_ORDER.map((stat) => (
          <div key={stat} className="flex items-center gap-2">
            <span className="w-14 text-xs font-medium text-pk-text-primary">
              {getStatName(stat)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={`Decrease ${getStatName(stat)} EVs by 4`}
                className="flex h-7 w-7 items-center justify-center border border-pk-border text-sm transition-colors hover:bg-pk-sidebar-bg"
                onClick={() => clampValue(stat, -4)}
              >
                −4
              </button>
              <input
                type="number"
                min={0}
                max={252}
                aria-label={`${getStatName(stat)} EVs`}
                value={evs[stat]}
                onChange={(e) => handleChange(stat, e.target.value)}
                className="h-7 w-16 border border-pk-border px-2 text-center text-sm font-mono text-pk-text-primary outline-none focus:ring-2 focus:ring-pk-text-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                aria-label={`Increase ${getStatName(stat)} EVs by 4`}
                className="flex h-7 w-7 items-center justify-center border border-pk-border text-sm transition-colors hover:bg-pk-sidebar-bg"
                onClick={() => clampValue(stat, 4)}
              >
                +4
              </button>
            </div>
            <div className="h-2 flex-1 rounded-full bg-pk-muted-bg">
              <div
                className="h-full rounded-full bg-pk-text-primary transition-all"
                style={{ width: `${(evs[stat] / 252) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs font-mono text-pk-text-secondary">
              {evs[stat]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
