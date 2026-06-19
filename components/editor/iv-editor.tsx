"use client";

import type { PokemonStat } from "@/types/pokemon";
import { getStatName } from "@/lib/stat-calculator";

interface IvEditorProps {
  ivs: Record<PokemonStat, number>;
  onChange: (ivs: Partial<Record<PokemonStat, number>>) => void;
}

const STAT_ORDER: PokemonStat[] = ["hp", "atk", "def", "spa", "spd", "spe"];

export function IvEditor({ ivs, onChange }: IvEditorProps) {
  const allMax = STAT_ORDER.every((s) => ivs[s] === 31);

  const handleChange = (stat: PokemonStat, value: string) => {
    const num = Math.max(0, Math.min(31, parseInt(value) || 0));
    onChange({ [stat]: num });
  };

  const maxAll = () => {
    const update: Partial<Record<PokemonStat, number>> = {};
    STAT_ORDER.forEach((s) => {
      update[s] = 31;
    });
    onChange(update);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-pk-text-secondary">
          IVs
        </p>
        <button
          type="button"
          onClick={maxAll}
          className="text-xs font-medium text-pk-text-primary underline underline-offset-2 transition-colors hover:text-pk-text-secondary"
        >
          {allMax ? "All Max ✓" : "Max All"}
        </button>
      </div>

      <div className="space-y-2">
        {STAT_ORDER.map((stat) => (
          <div key={stat} className="flex items-center gap-2">
            <span className="w-14 text-xs font-medium text-pk-text-primary">
              {getStatName(stat)}
            </span>
            <input
              type="number"
              min={0}
              max={31}
              aria-label={`${getStatName(stat)} IVs`}
              value={ivs[stat]}
              onChange={(e) => handleChange(stat, e.target.value)}
              className="h-8 w-20 border border-pk-border px-3 text-center text-sm font-mono text-pk-text-primary outline-none focus:ring-2 focus:ring-pk-text-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <div className="flex gap-1">
              {[0, 31].map((val) => (
                <button
                  key={val}
                  type="button"
                  aria-label={`Set ${getStatName(stat)} IVs to ${val}`}
                  onClick={() => onChange({ [stat]: val })}
                  className={`px-2 py-1 text-xs border transition-colors ${
                    ivs[stat] === val
                      ? "border-pk-text-primary bg-pk-text-primary text-white"
                      : "border-pk-border text-pk-text-secondary hover:bg-pk-sidebar-bg"
                  }`}
                >
                  {val === 0 ? "0" : "31"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
