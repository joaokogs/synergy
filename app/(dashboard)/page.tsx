"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Copy, Pencil, Trash2, EllipsisVertical } from "lucide-react";
import { TeamGrid } from "@/components/layout/team-grid";
import { useTeam } from "@/hooks/use-team";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function TeamPage() {
  const router = useRouter();
  const {
    teams,
    activeTeamId,
    team,
    setActiveTeam,
    setActiveSlot,
    createTeam,
    deleteTeam,
    duplicateTeam,
    renameTeam,
  } = useTeam();

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEditPokemon = (slot: number) => {
    setActiveSlot(slot);
    router.push("/builder");
  };

  const handleCreate = () => {
    createTeam();
  };

  const handleOpenRename = () => {
    if (team) {
      setRenameValue(team.name);
      setRenameOpen(true);
    }
  };

  const handleRename = () => {
    if (team && renameValue.trim()) {
      renameTeam(team.id, renameValue.trim());
      setRenameOpen(false);
    }
  };

  const handleOpenDelete = () => {
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    deleteTeam(activeTeamId);
  };

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 md:mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-pk-text-primary">
              Teams
            </h1>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-lg border border-pk-border bg-pk-card-bg p-2.5">
          <Select value={activeTeamId} onValueChange={(v) => v && setActiveTeam(v)}>
            <SelectTrigger className="min-w-[200px]">
              <SelectValue>
                {team ? (
                  <span className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {team.name}
                  </span>
                ) : (
                  "Select a team"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {t.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="default" size="sm" onClick={handleCreate}>
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>

          <div className="ml-auto">
            <Popover>
              <PopoverTrigger
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Team actions"
              >
                <EllipsisVertical className="h-4 w-4" />
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={4} className="w-44 p-1">
                <button
                  type="button"
                  onClick={handleOpenRename}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => duplicateTeam(activeTeamId)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  Duplicate
                </button>
                {teams.length > 1 && (
                  <>
                    <div className="my-1 h-px bg-border" />
                    <button
                      type="button"
                      onClick={handleOpenDelete}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <TeamGrid onEdit={handleEditPokemon} />
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Team</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
            placeholder="Team name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!renameValue.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{team?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Yes, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
