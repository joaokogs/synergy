"use client";

import type { PokemonStat } from "@/types/pokemon";
import {
  calculateStat,
  getStatLabel,
  getMaxPossibleStat,
  getNatureEffect,
  STAT_ORDER,
} from "@/lib/stat-calculator";

interface UnifiedStatsProps {
  baseStats: Record<PokemonStat, number>;
  ivs: Record<PokemonStat, number>;
  evs: Record<PokemonStat, number>;
  nature: string | null;
  level?: number;
  onUpdateIvs: (ivs: Partial<Record<PokemonStat, number>>) => void;
  onUpdateEvs: (evs: Partial<Record<PokemonStat, number>>) => void;
}

export function UnifiedStats({
  baseStats,
  ivs,
  evs,
  nature,
  level = 50,
  onUpdateIvs,
  onUpdateEvs,
}: UnifiedStatsProps) {
  const totalEvs = Object.values(evs).reduce((a, b) => a + b, 0);
  const remainingEvs = 510 - totalEvs;

  const handleIvChange = (stat: PokemonStat, value: string) => {
    const num = Math.max(0, Math.min(31, parseInt(value) || 0));
    onUpdateIvs({ [stat]: num });
  };

  const handleEvChange = (stat: PokemonStat, value: string) => {
    const num = Math.max(0, Math.min(252, parseInt(value) || 0));
    const currentTotal = totalEvs - evs[stat];
    if (currentTotal + num <= 510) {
      onUpdateEvs({ [stat]: num });
    }
  };

  const handleEvSlider = (stat: PokemonStat, value: string) => {
    const num = Math.max(0, Math.min(252, parseInt(value) || 0));
    const currentTotal = totalEvs - evs[stat];
    const maxAllowed = Math.min(252, 510 - currentTotal);
    onUpdateEvs({ [stat]: Math.min(num, maxAllowed) });
  };

  const maxAllIvs = () => {
    const max: Partial<Record<PokemonStat, number>> = {};
    STAT_ORDER.forEach((s) => { max[s] = 31; });
    onUpdateIvs(max);
  };

  const resetEvs = () => {
    const reset: Partial<Record<PokemonStat, number>> = {};
    STAT_ORDER.forEach((s) => { reset[s] = 0; });
    onUpdateEvs(reset);
  };

  return (
    <div className="border border-pk-border bg-pk-card-bg p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-pk-text-secondary">
          Stats at Lv. {level}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-pk-text-secondary">
            {remainingEvs >= 0 ? `${remainingEvs} remaining` : "Over limit!"}
          </span>
          <button
            type="button"
            onClick={resetEvs}
            className="text-[10px] font-medium text-pk-text-secondary underline underline-offset-2 transition-colors hover:text-pk-text-primary"
          >
            Reset EVs
          </button>
          <button
            type="button"
            onClick={maxAllIvs}
            className="text-[10px] font-medium text-pk-text-secondary underline underline-offset-2 transition-colors hover:text-pk-text-primary"
          >
            Max IVs
          </button>
        </div>
      </div>

      {/* Header row */}
      <div className="mb-1 flex items-center gap-1.5 px-1">
        <span className="w-8 text-[9px] font-bold uppercase text-pk-text-secondary" />
        <span className="w-8 text-right text-[9px] font-bold uppercase text-pk-text-secondary">Base</span>
        <span className="w-8 text-center text-[9px] font-bold uppercase text-pk-text-secondary">IV</span>
        <span className="flex-1 text-center text-[9px] font-bold uppercase text-pk-text-secondary">EV</span>
        <span className="w-5 text-center text-[9px] font-bold uppercase text-pk-text-secondary">Nat</span>
        <span className="w-10 text-right text-[9px] font-bold uppercase text-pk-text-secondary">Final</span>
        <span className="w-28 text-[9px] font-bold uppercase text-pk-text-secondary" />
      </div>

      <div className="space-y-0.5">
        {STAT_ORDER.map((stat) => {
          const finalStat = calculateStat(baseStats[stat], ivs[stat], evs[stat], stat, level, nature);
          const maxStat = getMaxPossibleStat(baseStats[stat], stat === "hp", level);
          const barPercent = Math.min(100, (finalStat / maxStat) * 100);
          const natureEffect = getNatureEffect(nature, stat);

          return (
            <div
              key={stat}
              className="flex items-center gap-1.5 rounded-sm px-1 py-1 transition-colors hover:bg-pk-hover-bg"
            >
              {/* Stat label */}
              <span className="w-8 text-[11px] font-bold text-pk-text-primary">
                {getStatLabel(stat)}
              </span>

              {/* Base stat */}
              <span className="w-8 text-right text-[10px] font-mono text-pk-text-secondary">
                {baseStats[stat]}
              </span>

              {/* IV input */}
              <input
                type="number"
                min={0}
                max={31}
                aria-label={`${getStatLabel(stat)} IV`}
                value={ivs[stat]}
                onChange={(e) => handleIvChange(stat, e.target.value)}
                className="h-5 w-8 border border-pk-border bg-transparent px-0.5 text-center text-[9px] font-mono text-pk-text-primary outline-none focus:ring-1 focus:ring-pk-text-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />

              {/* EV slider + number */}
              <div className="flex flex-1 items-center gap-1">
                <input
                  type="range"
                  min={0}
                  max={252}
                  value={evs[stat]}
                  onChange={(e) => handleEvSlider(stat, e.target.value)}
                  aria-label={`${getStatLabel(stat)} EV`}
                  className="ev-slider h-1 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent"
                  style={{ "--ev-fill": `${(evs[stat] / 252) * 100}%` } as React.CSSProperties}
                />
                <input
                  type="number"
                  min={0}
                  max={252}
                  aria-label={`${getStatLabel(stat)} EV value`}
                  value={evs[stat]}
                  onChange={(e) => handleEvChange(stat, e.target.value)}
                  className="h-5 w-8 shrink-0 border border-pk-border bg-transparent px-0.5 text-center text-[9px] font-mono text-pk-text-primary outline-none focus:ring-1 focus:ring-pk-text-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              {/* Nature indicator */}
              <span
                className="w-5 text-center text-[11px] font-bold"
                style={{
                  color:
                    natureEffect === "boost"
                      ? "#22c55e"
                      : natureEffect === "reduce"
                        ? "#ef4444"
                        : "var(--pk-text-secondary)",
                }}
              >
                {natureEffect === "boost" ? "↑" : natureEffect === "reduce" ? "↓" : "−"}
              </span>

              {/* Final stat */}
              <span className="w-10 text-right text-[12px] font-mono font-bold text-pk-text-primary">
                {finalStat}
              </span>

              {/* Stat bar */}
              <div className="h-2 w-28 overflow-hidden bg-pk-muted-bg">
                <div
                  className="h-full transition-all duration-150"
                  style={{
                    width: `${barPercent}%`,
                    backgroundColor:
                      natureEffect === "boost"
                        ? "#22c55e"
                        : natureEffect === "reduce"
                          ? "#ef4444"
                          : "var(--pk-text-primary)",
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .ev-slider {
          accent-color: var(--pk-text-primary, #1a1a1a);
        }
        .ev-slider::-webkit-slider-track {
          height: 4px;
          background: linear-gradient(to right, var(--pk-text-primary, #1a1a1a) 0%, var(--pk-text-primary, #1a1a1a) var(--ev-fill, 0%), var(--pk-muted-bg, #e5e7eb) var(--ev-fill, 0%), var(--pk-muted-bg, #e5e7eb) 100%);
        }
        .ev-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          background: var(--pk-card-bg, #ffffff);
          cursor: pointer;
          border: 2px solid var(--pk-text-primary, #1a1c1c);
          border-radius: 0;
        }
        .ev-slider::-moz-range-track {
          height: 4px;
          background: var(--pk-muted-bg, #e5e7eb);
        }
        .ev-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          background: var(--pk-card-bg, #ffffff);
          cursor: pointer;
          border: 2px solid var(--pk-text-primary, #1a1c1c);
          border-radius: 0;
        }
        .ev-slider::-moz-range-progress {
          height: 4px;
          background: var(--pk-text-primary, #1a1a1a);
        }
      `}</style>
    </div>
  );
}
