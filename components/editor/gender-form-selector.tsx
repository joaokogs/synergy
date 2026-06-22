"use client";

import { Venus, Mars } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PokemonBase, PokemonForm } from "@/types/pokemon";

interface GenderFormSelectorProps {
  pokemon: PokemonBase;
  gender?: "male" | "female";
  activeForm?: PokemonForm | null;
  onGenderChange: (gender: "male" | "female") => void;
  onFormChange: (formName: string) => void;
}

export function GenderFormSelector({
  pokemon,
  gender,
  activeForm,
  onGenderChange,
  onFormChange,
}: GenderFormSelectorProps) {
  const hasGender =
    pokemon.genderRate !== undefined && pokemon.genderRate >= 0;
  const hasForms = pokemon.forms && pokemon.forms.length > 0;

  if (!hasGender && !hasForms) return null;

  return (
    <div className="border border-pk-border bg-pk-card-bg p-4">
      <label className="text-[10px] font-bold uppercase tracking-widest text-pk-text-secondary">
        Gender / Form
      </label>
      <div className="mt-1.5 flex flex-col gap-2">
        {hasGender && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onGenderChange("male")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                gender !== "female"
                  ? "bg-primary text-primary-foreground"
                  : "bg-pk-muted-bg text-pk-text-secondary hover:bg-pk-hover-bg"
              }`}
            >
              <Mars className="h-3.5 w-3.5" />
              Male
            </button>
            <button
              type="button"
              onClick={() => onGenderChange("female")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                gender === "female"
                  ? "bg-primary text-primary-foreground"
                  : "bg-pk-muted-bg text-pk-text-secondary hover:bg-pk-hover-bg"
              }`}
            >
              <Venus className="h-3.5 w-3.5" />
              Female
            </button>
          </div>
        )}

        {hasForms && (
          <Select
            value={activeForm?.name ?? pokemon.name}
            onValueChange={(value) => {
              if (value) onFormChange(value);
            }}
          >
            <SelectTrigger className="w-full text-xs">
              <SelectValue>
                {activeForm
                  ? activeForm.displayName
                  : pokemon.displayName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Forms</SelectLabel>
                <SelectItem value={pokemon.name}>
                  {pokemon.displayName}
                </SelectItem>
                {pokemon.forms!.map((form) => (
                  <SelectItem key={form.name} value={form.name}>
                    {form.displayName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
