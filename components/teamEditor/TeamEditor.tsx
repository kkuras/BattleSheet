"use client";

import { useState } from "react";
import type { PokemonOption } from "@/lib/pokeapi";
import PokemonCombobox from "./PokemonCombobox";

type SlotPokemon = {
    id: string;
    slot: number;
    species: string;
};

type TeamEditorProps = {
    pokemons: SlotPokemon[];
    pokemonOptions: PokemonOption[];
}

export default function TeamEditor({ pokemons, pokemonOptions }: TeamEditorProps) {
    const [selectedSlot, setSelectedSlot] = useState(1);

    const selectedPokemon = pokemons.find((p) => p.slot === selectedSlot);

    const [species, setSpecies] = useState("");

    return (
    <div className="grid grid-cols-[220px_1fr] gap-6 mt-6">
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5, 6].map((slot) => {
          const pokemon = pokemons.find((p) => p.slot === slot);
          const active = slot === selectedSlot;

          return (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`text-left px-3 py-3 rounded border text-sm transition-colors ${
                active
                  ? "border-[#f3c642] bg-[#2c2a38]"
                  : "border-[#3a3846] hover:border-[#8b93a7]"
              }`}
            >
              <span className="text-xs text-[#8b93a7]">Slot {slot}</span>
              <span className="block font-semibold">
                {pokemon ? pokemon.species : "Vazio"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="border border-[#3a3846] rounded-xl p-6 bg-[#2c2a38]">
        <h2>Slot {selectedSlot}</h2>
        <p className="text-sm text-[#8b93a7] mt-2">
          {selectedPokemon
            ? `Editando ${selectedPokemon.species}`
            : "Nenhum Pokémon neste slot ainda."}
        </p>

        <label className="block text-sm text-[#8b93a7] mt-4 mb-1">Pokémon</label>
        <PokemonCombobox
          options={pokemonOptions}
          value={species}
          onChange={setSpecies}
        />
      </div>
    </div>
  );
}


