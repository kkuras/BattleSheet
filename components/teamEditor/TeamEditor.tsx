"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { normalizeName, type PokemonOption } from "@/lib/pokeapi";
import PokemonCombobox from "./PokemonCombobox";

// Um Pokémon que já está salvo no banco (vem da página /times/[id])
type SlotPokemon = {
  id: string;
  slot: number;
  species: string;
};

// Os dados de um slot enquanto você edita (por enquanto só a espécie)
type SlotData = {
  species: string;
  // quando adicionar item, ability etc., as chaves novas entram aqui
};

type TeamEditorProps = {
    teamId: string;
    pokemons: SlotPokemon[];
    pokemonOptions: PokemonOption[];
}

const SLOTS = [1, 2, 3, 4, 5, 6];

// Monta o estado dos 6 slots a partir do que veio do banco (slot sem Pokémon fica vazio)
function buildSlots(pokemons: SlotPokemon[]): Record<number, SlotData> {
  const result: Record<number, SlotData> = {};

  for (const slot of SLOTS) {
    const found = pokemons.find((p) => p.slot === slot);
    result[slot] = { species: found?.species ?? "" };
  }

  return result;
}

export default function TeamEditor({
  teamId,
  pokemons,
  pokemonOptions,
}: TeamEditorProps) {
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [slots, setSlots] = useState(() => buildSlots(pokemons));
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  // O que está salvo no banco agora, para comparar com o que está na tela
  const savedSlots = buildSlots(pokemons);
  const hasChanges = SLOTS.some(
    (slot) => slots[slot].species !== savedSlots[slot].species
  );

  // Muda só os campos informados de um slot, sem mexer nos outros
  function updateSlot(slot: number, changes: Partial<SlotData>) {
    setSlots((prev) => ({ ...prev, [slot]: { ...prev[slot], ...changes } }));
    setJustSaved(false);
  }

  // Devolve o sprite pelo nome; fica undefined se o nome não está na lista da PokéAPI
  function getSprite(species: string) {
    return pokemonOptions.find((o) => o.name === species)?.sprite;
  }

  // Pokémon escolhido no slot que está aberto no painel da direita
  const selectedSpecies = slots[selectedSlot].species;
  const selectedSprite = getSprite(selectedSpecies);

  // Salva o time inteiro: grava os slots com Pokémon e apaga os que ficaram vazios
  async function handleSave() {
    setSaving(true);
    setSaveError("");
    setJustSaved(false);

    const filled = SLOTS.filter((slot) => slots[slot].species !== "");
    const empty = SLOTS.filter((slot) => slots[slot].species === "");

    if (filled.length > 0) {
      const rows = filled.map((slot) => ({
        team_id: teamId,
        slot,
        species: slots[slot].species,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("team_pokemons")
        .upsert(rows, { onConflict: "team_id,slot" });

      if (error) {
        setSaveError(error.message);
        setSaving(false);
        return;
      }
    }

    if (empty.length > 0) {
      const { error } = await supabase
        .from("team_pokemons")
        .delete()
        .eq("team_id", teamId)
        .in("slot", empty);

      if (error) {
        setSaveError(error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setJustSaved(true);
    router.refresh();
  }

return (
    <div>
      {/* Área principal: lista de slots à esquerda, painel de edição à direita */}
      <div className="grid grid-cols-[220px_1fr] gap-6 mt-6">
        {/* Lista de slots (coluna da esquerda) */}
        <div className="flex flex-col gap-2">
          {SLOTS.map((slot) => {
            const active = slot === selectedSlot;
            const species = slots[slot].species;
            const sprite = getSprite(species);

            return (
              /* Botão de um slot: miniatura à esquerda, textos à direita */
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`flex items-center gap-3 text-left ${
                  active
                    ? "" /* estilo do slot selecionado */
                    : "" /* estilo dos outros slots */
                }`}
              >
                {/* Espaço da miniatura: tem sempre o mesmo tamanho, com ou sem Pokémon */}
                <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                  {sprite ? (
                    <img src={sprite} alt="" className="w-12 h-12" />
                  ) : (
                    <span>{species ? "?" : ""}</span>
                  )}
                </div>

                {/* Textos: número do slot e nome do Pokémon (ou "Vazio") */}
                <div>
                  <span>Slot {slot}</span>
                  <span className="block">{species || "Vazio"}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Painel de edição (coluna da direita): edita o slot selecionado */}
        <div>
          <h2>Slot {selectedSlot}</h2>

          {/* Rótulo do campo; block faz ele ocupar a linha toda, em cima do campo */}
          <label className="block mt-4 mb-1">Pokémon</label>

          {/* Campo pesquisável; o key reinicia o texto do campo ao trocar de slot */}
          <PokemonCombobox
            key={selectedSlot}
            options={pokemonOptions}
            value={selectedSpecies}
            onChange={(name) => updateSlot(selectedSlot, { species: name })}
          />

          {/* Confirmação visual: aparece só quando o slot tem um Pokémon escolhido */}
          {selectedSpecies && (
            <div className="flex items-center gap-4 mt-4">
              {/* Sprite grande, ou um "?" se o nome não tem imagem */}
              {selectedSprite ? (
                <img src={selectedSprite} alt="" className="w-24 h-24" />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center">?</div>
              )}

              {/* Nome do Pokémon escolhido */}
              <p>{selectedSpecies}</p>
            </div>
          )}
        </div>
      </div>

      {/* Barra de ações do time: fica abaixo da grid, botão e avisos lado a lado */}
      <div className="flex items-center gap-3 mt-4">
        {/* Botão que salva os 6 slots de uma vez; desabilitado sem mudanças ou enquanto salva */}
        <button
          className="cursor-pointer border border-green-600 bg-green-600 rounded-md px-1 py-1
                          hover:bg-green-700 hover:border-green-700
                          disabled:opacity-50 disabled:cursor-not-allowed
                          disabled:hover:bg-green-600 disabled:hover:border-green-600"
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? "Salvando..." : "Salvar time"}
        </button>

        {/* Aviso de mudanças ainda não gravadas no banco */}
        {hasChanges && !saving && <span>Alterações não salvas</span>}

        {/* Confirmação depois de salvar */}
        {justSaved && <span>Time salvo!</span>}

        {/* Mensagem de erro, se o Supabase recusar o salvamento */}
        {saveError && <p>{saveError}</p>}
      </div>
    </div>
  );
}


