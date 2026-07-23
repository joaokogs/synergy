"use client";

import { Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useTeam } from "@/hooks/use-team";
import { ThemeToggle } from "@/components/theme-toggle";
import { parsePokepaste } from "@/lib/parse-pokepaste";
import { getPokemonData } from "@/lib/pokeapi";
import type { PokemonBase, PokemonType } from "@/types/pokemon";
import { useTeamStore } from "@/stores/team-store";

export function TopBar() {
  const [importOpen, setImportOpen] = useState(false);
  const [paste, setPaste] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const { team } = useTeam();

  const handleImport = async () => {
    if (!paste.trim() || importing) return;

    setImporting(true);
    setImportError(null);

    try {
      const parsed = parsePokepaste(paste);
      if (parsed.length === 0) {
        setImportError("No Pokémon found in the pasted data.");
        setImporting(false);
        return;
      }

      const teamData: { base: PokemonBase; parsed: typeof parsed[number] }[] = [];

      for (const p of parsed) {
        const base = await getPokemonData(p.name);
        teamData.push({ base, parsed: p });
      }

      const store = useTeamStore.getState();
      const currentTeam = store.teams.find((t) => t.id === store.activeTeamId);
      if (!currentTeam) {
        setImportError("No active team found.");
        setImporting(false);
        return;
      }

      const members = Array(6).fill(null);

      for (let i = 0; i < Math.min(teamData.length, 6); i++) {
        const { base, parsed: p } = teamData[i];
        const validTypes = base.types as readonly string[];
        const teraType = p.teraType && validTypes.includes(p.teraType)
          ? p.teraType as PokemonType
          : base.types[0];

        const defaultGender =
          base.genderRate !== undefined && base.genderRate >= 0
            ? ("male" as const)
            : undefined;

        members[i] = {
          slot: i + 1,
          pokemon: base,
          item: p.item ?? null,
          ability: p.ability ?? base.abilities[0] ?? null,
          teraType,
          nature: p.nature ?? null,
          level: p.level ?? 50,
          gender: defaultGender,
          activeForm: null,
          moves: p.moves.length > 0
            ? [...p.moves.slice(0, 4), ...Array(Math.max(0, 4 - p.moves.length)).fill(null)]
            : [null, null, null, null],
          evs: {
            hp: p.evs.hp ?? 0,
            atk: p.evs.atk ?? 0,
            def: p.evs.def ?? 0,
            spa: p.evs.spa ?? 0,
            spd: p.evs.spd ?? 0,
            spe: p.evs.spe ?? 0,
          },
          ivs: {
            hp: p.ivs.hp ?? 31,
            atk: p.ivs.atk ?? 31,
            def: p.ivs.def ?? 31,
            spa: p.ivs.spa ?? 31,
            spd: p.ivs.spd ?? 31,
            spe: p.ivs.spe ?? 31,
          },
        };
      }

      useTeamStore.setState({
        teams: store.teams.map((t) =>
          t.id === store.activeTeamId ? { ...t, members } : t
        ),
      });

      setImportOpen(false);
      setPaste("");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to import team.");
    } finally {
      setImporting(false);
    }
  };

  function toDisplayName(text: string): string {
    return text
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const evLabel: Record<string, string> = {
    hp: "HP", atk: "Atk", def: "Def",
    spa: "SpA", spd: "SpD", spe: "Spe",
  }

  const handleExport = () => {
    const exportText = team.members
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .map((m) => {
        const lines: string[] = [
          `${m.pokemon.displayName}${m.item ? ` @ ${toDisplayName(m.item)}` : ""}`,
          `Ability: ${m.ability ? toDisplayName(m.ability) : "Unknown"}`,
        ]

        const teraType = m.teraType
        if (teraType) {
          lines.push(`Tera Type: ${toDisplayName(teraType)}`)
        }

        const evsStr = Object.entries(m.evs)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${v} ${evLabel[k] ?? k.toUpperCase()}`)
          .join(" / ")
        if (evsStr) lines.push(`EVs: ${evsStr}`)

        const non31Ivs = Object.entries(m.ivs).filter(([, v]) => v !== 31)
        if (non31Ivs.length > 0) {
          lines.push(
            `IVs: ${non31Ivs
              .map(([k, v]) => `${v} ${evLabel[k] ?? k.toUpperCase()}`)
              .join(" / ")}`
          )
        }

        if (m.nature) {
          lines.push(`${toDisplayName(m.nature)} Nature`)
        }

        const moves = m.moves.filter((m): m is string => m !== null)
        if (moves.length > 0) {
          lines.push(...moves.map((move) => `- ${toDisplayName(move)}`))
        }

        return lines.join("\n")
      })
      .join("\n\n")

    navigator.clipboard?.writeText(exportText).then(() => {
      alert("Team exported to clipboard!");
    });
  };

  return (
    <header className="flex items-center justify-end border-b border-pk-border bg-pk-card-bg px-6 py-3">
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogTrigger className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground">
            <Download className="h-3.5 w-3.5" />
            Import
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import PokéPaste</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Paste your team data here..."
                className="min-h-[200px] max-h-[50vh] font-mono text-sm"
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
              />
              {importError && (
                <p className="text-xs text-destructive">{importError}</p>
              )}
              <Button
                onClick={handleImport}
                className="w-full"
                disabled={!paste.trim() || importing}
              >
                {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                {importing ? "Importing..." : "Import Team"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={handleExport}
        >
          <Upload className="h-3.5 w-3.5" />
          Export
        </Button>

      </div>
    </header>
  );
}
