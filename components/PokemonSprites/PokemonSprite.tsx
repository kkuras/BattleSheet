"use client";

import { useState } from "react";

type PokemonSpriteProps = {
  src: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
};

export default function PokemonSprite({
  src,
  fallbackSrc,
  alt = "",
  className,
}: PokemonSpriteProps) {
  // Guarda qual endereço já falhou; se mudar o src, o aviso de falha deixa de valer sozinho
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // Se a principal falhou e existe reserva, mostra a reserva
  const finalSrc = failedSrc === src && fallbackSrc ? fallbackSrc : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}