"use client";

import { useState } from "react";

type PokemonSpriteProps = {
  sources: string[];
  alt?: string;
  className?: string;
};

export default function pokemonSprites({
  sources,
  alt = "",
  className,
}: PokemonSpriteProps) {
  // Identifica esta lista de imagens; se a lista mudar, a contagem de falhas recomeça
  const key = sources.join("|");

  // Quantas imagens já falharam para esta lista
  const [failure, setFailure] = useState({ key: "", count: 0 });
  const failedCount = failure.key === key ? failure.count : 0;

  // Mostra a primeira que ainda não falhou (a última, se todas falharam)
  const src = sources[Math.min(failedCount, sources.length - 1)];

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailure({ key, count: failedCount + 1 })}
    />
  );
}