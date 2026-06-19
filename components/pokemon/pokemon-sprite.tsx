"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PokemonSpriteProps {
  id: number;
  size?: number;
  className?: string;
  alt?: string;
}

export function PokemonSprite({
  id,
  size = 64,
  className,
  alt = "Pokémon",
}: PokemonSpriteProps) {
  const [error, setError] = useState(false);

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
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
          alt={alt}
          width={size * 0.75}
          height={size * 0.75}
          className="object-contain"
          onError={() => setError(true)}
          priority
        />
      ) : (
        <span className="text-xs text-pk-text-secondary">?</span>
      )}
    </div>
  );
}
