"use client";

import { Upload, Download } from "lucide-react";
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

export function TopBar() {
  const [importOpen, setImportOpen] = useState(false);
  const [paste, setPaste] = useState("");
  const { team } = useTeam();

  const handleImport = () => {
    if (paste.trim()) {
      console.log("Import:", paste);
      setImportOpen(false);
      setPaste("");
    }
  };

  const handleExport = () => {
    const exportText = team.members
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .map((m) => {
        const lines = [
          `${m.pokemon.displayName} @ ${m.item ?? "No Item"}`,
          `Ability: ${m.ability ?? "Unknown"}`,
          `Tera Type: ${m.teraType ?? "Unknown"}`,
          `EVs: ${Object.entries(m.evs)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => `${v} ${k.toUpperCase()}`)
            .join(" / ")}`,
          `IVs: ${Object.entries(m.ivs)
            .map(([k, v]) => `${v} ${k.toUpperCase()}`)
            .join(" / ")}`,
          ...(m.nature ? [`${m.nature} Nature`] : []),
          ...m.moves.filter(Boolean).map((move) => `- ${move}`),
        ];
        return lines.join("\n");
      })
      .join("\n\n");

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
                className="min-h-[200px] font-mono text-sm"
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
              />
              <Button
                onClick={handleImport}
                className="w-full"
                disabled={!paste.trim()}
              >
                Import Team
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
