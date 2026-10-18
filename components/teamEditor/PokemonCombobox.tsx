"use client";

import { useState } from "react";
import { normalizeName, type PokemonOption } from "@/lib/pokeapi";

type PokemonComboboxProps = {
  options: PokemonOption[];
  // Nome do Pokémon já escolhido neste slot ("" se não tem nenhum)
  value: string;
  // Chamado só quando a escolha MUDA de verdade: clique numa sugestão, ou "" se o campo foi esvaziado
  onChange: (name: string) => void;
};

export default function PokemonCombobox({
  options,
  value,
  onChange,
}: PokemonComboboxProps) {
  // Texto que está no campo agora (pode estar incompleto enquanto a pessoa edita)
  const [text, setText] = useState(value);
  // Controla se a lista de sugestões está aberta
  const [open, setOpen] = useState(false);

  const query = normalizeName(text);

  // Até 6 sugestões que contêm o texto digitado; o nome exato, se existir, vai para o topo
  const results = query
    ? options
        .filter((o) => normalizeName(o.name).includes(query))
        .sort(
          (a, b) =>
            Number(normalizeName(b.name) === query) -
            Number(normalizeName(a.name) === query)
        )
        .slice(0, 6)
    : [];

  // Ao clicar numa sugestão: preenche o campo e confirma a escolha (única forma de escolher)
  function choose(name: string) {
    setText(name);
    setOpen(false);
    if (name !== value) {
      onChange(name);
    }
  }

  // Ao sair do campo: vazio limpa o slot; qualquer outro texto volta para o Pokémon escolhido
  function handleBlur() {
    setOpen(false);

    if (text.trim() === "") {
      if (value !== "") onChange("");
      return;
    }

    setText(value);
  }

  return (
    /* Contêiner: define a largura do campo (troque o w-64) e serve de referência para a lista flutuar */
    <div className="relative w-64">
      {/* Campo de texto: ocupa a largura do contêiner; digitar só filtra a lista */}
      <input
        className="w-full"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder="Digite o nome do Pokémon"
      />

      {/* Lista de sugestões, flutuando logo abaixo do campo; o fundo opaco é necessário para ela ser legível */}
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-10 bg-[#23212c] border border-[#3a3846]">
          {results.map((o) => (
            <li key={o.id}>
              {/* Uma sugestão: sprite à esquerda, nome à direita; clicar escolhe o Pokémon */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(o.name);
                }}
                className="w-full flex items-center gap-3 text-left"
              >
                <img src={o.sprite} alt="" className="w-14 h-14" />
                {o.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
    );
}