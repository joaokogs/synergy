"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPokemonFormSpriteUrl } from "@/lib/pokeapi";

interface PokemonSpriteProps {
  id: number;
  size?: number;
  className?: string;
  alt?: string;
  gender?: "male" | "female";
  spriteUrl?: string;
}

export function PokemonSprite({
  id,
  size = 64,
  className,
  alt = "Pokémon",
  gender,
  spriteUrl: externalUrl,
}: PokemonSpriteProps) {
  const [error, setError] = useState(false);

  const spriteUrl = externalUrl ?? getPokemonFormSpriteUrl(id);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-pk-muted-bg",
        className
      )}
      style={{ width: size, height: size }}
    >
      {!error ? (
        <Image
          key={`${id}-${gender ?? "default"}`}
          src={spriteUrl}
          alt={alt}
          width={size * 0.75}
          height={size * 0.75}
          className="object-contain"
          onError={() => setError(true)}
          priority
        />
      ) : (
        <Image
          key={`${id}-fallback`}
          src={getPokemonFormSpriteUrl(id)}
          alt={alt}
          width={size * 0.75}
          height={size * 0.75}
          className="object-contain"
          onError={() => setError(true)}
          priority
        />
      )}
    </div>
  );
}
