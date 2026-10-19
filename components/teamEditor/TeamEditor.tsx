"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { PokemonOption } from "@/lib/pokeapi";
import { NATURES, TERA_TYPES } from "@/lib/pokemonData";
import PokemonCombobox from "./PokemonCombobox";

// Estilo compartilhado dos campos (apelido, nature, tera type); o disabled: deixa o campo apagado
const fieldClass =
  "w-full bg-[#2c2a38] border border-[#4a4757] rounded px-3 py-2 text-[#e8eaed] focus:outline-none focus:border-[#f3c642] disabled:opacity-40 disabled:cursor-not-allowed";

// Um Pokémon que já está salvo no banco (vem da página /times/[id]); campos opcionais podem vir null
type SlotPokemon = {
  id: string;
  slot: number;
  species: string;
  nickname: string | null;
  nature: string | null;
  tera_type: string | null;
};

// Os dados de um slot enquanto você edita; texto vazio ("") significa "não preenchido"
type SlotData = {
  species: string;
  nickname: string; // o que está no campo agora (é o que vai para o banco)
  shownNickname: string; // o apelido exibido na lista de slots (só atualiza ao sair do campo)
  nature: string;
  teraType: string;
  // quando adicionar EVs, IVs, item etc., as chaves novas entram aqui
};

type TeamEditorProps = {
  teamId: string;
  pokemons: SlotPokemon[];
  pokemonOptions: PokemonOption[];
};

const SLOTS = [1, 2, 3, 4, 5, 6];

// Monta o estado dos 6 slots a partir do que veio do banco (null vira texto vazio)
function buildSlots(pokemons: SlotPokemon[]): Record<number, SlotData> {
  const result: Record<number, SlotData> = {};

  for (const slot of SLOTS) {
    const found = pokemons.find((p) => p.slot === slot);

    result[slot] = {
      species: found?.species ?? "",
      nickname: found?.nickname ?? "",
      shownNickname: found?.nickname ?? "",
      nature: found?.nature ?? "",
      teraType: found?.tera_type ?? "",
    };
  }

  return result;
}

// Compara dois slots; num slot vazio, só importa que os dois estão vazios
function sameSlot(a: SlotData, b: SlotData) {
  if (a.species !== b.species) return false;
  if (a.species === "") return true;

  return (
    a.nickname.trim() === b.nickname.trim() &&
    a.nature === b.nature &&
    a.teraType === b.teraType
  );
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
    (slot) => !sameSlot(slots[slot], savedSlots[slot])
  );

  // Muda só os campos informados de um slot, sem mexer nos outros
  function updateSlot(slot: number, changes: Partial<SlotData>) {
    setSlots((prev) => ({ ...prev, [slot]: { ...prev[slot], ...changes } }));
    setJustSaved(false);
  }

  // Atualiza só o apelido que aparece na lista de slots (chamada ao sair do campo de apelido)
  function syncShownNickname(slot: number, value: string) {
    setSlots((prev) => ({
      ...prev,
      [slot]: { ...prev[slot], shownNickname: value },
    }));
  }

  // Devolve o sprite pelo nome; fica undefined se o nome não está na lista da PokéAPI
  function getSprite(species: string) {
    return pokemonOptions.find((o) => o.name === species)?.sprite;
  }

  // Dados do slot que está aberto no painel da direita
  const current = slots[selectedSlot];
  const selectedSpecies = current.species;
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
        // texto vazio vira null no banco
        nickname: slots[slot].nickname.trim() || null,
        nature: slots[slot].nature || null,
        tera_type: slots[slot].teraType || null,
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
        {/* Lista de slots (coluna da esquerda): caixa com fundo e um respiro interno */}
        <div className="flex flex-col gap-2 bg-[#262431] border border-[#3a3846] rounded-xl p-3">
          {SLOTS.map((slot) => {
            const active = slot === selectedSlot;
            const species = slots[slot].species;
            const nickname = slots[slot].shownNickname.trim();
            const sprite = getSprite(species);

            return (
              /* Botão de um slot: miniatura à esquerda, textos à direita */
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`flex items-center gap-3 text-left rounded-lg p-2 border transition-colors ${
                  active
                    ? "bg-[#3a3846] border-[#f3c642]" /* slot selecionado */
                    : "border-transparent hover:bg-[#3a3846]/50" /* outros slots */
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
                  {/* Textos: número do slot e o nome mostrado (o apelido, se tiver; senão a espécie) */}
                  <div>
                    <span>Slot {slot}</span>
                    <span className="block">{(species && (nickname || species)) || "Vazio"}</span>
                  </div>
              </button>
            );
          })}
        </div>

        {/* Painel de edição (coluna da direita): edita o slot selecionado */}
        <div className="bg-[#2c2a38] border border-[#3a3846] rounded-xl p-6">
          <h2>Slot {selectedSlot}</h2>

          {/* Rótulo do campo de Pokémon; block faz ele ocupar a linha toda, em cima do campo */}
          <label className="block mt-4 mb-1 text-sm text-[#8b93a7]">Pokémon</label>

          {/* Campo pesquisável; ao esvaziar o nome, os campos do slot são zerados */}
          <PokemonCombobox
            key={selectedSlot}
            options={pokemonOptions}
            value={selectedSpecies}
            onChange={(name) =>
              updateSlot(
                selectedSlot,
                name === ""
                  ? { species: "", nickname: "", shownNickname: "", nature: "", teraType: "" }
                  : { species: name }
              )
            }
          />

          {/* Área do sprite: tem sempre a mesma altura (h-24), com ou sem Pokémon, para a caixa dos campos não pular */}
          <div className="flex items-center gap-4 mt-4 h-24">
            {/* O conteúdo só aparece quando o slot tem Pokémon escolhido */}
            {selectedSpecies && (
              <>
                {/* Sprite grande, ou um "?" se o nome não tem imagem */}
                {selectedSprite ? (
                  <img src={selectedSprite} alt="" className="w-24 h-24" />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center">?</div>
                )}

                {/* Nome do Pokémon escolhido */}
                <p>{selectedSpecies}</p>
              </>
            )}
          </div>

          {/* Campos do Pokémon: SEMPRE visíveis, mas só editáveis quando o slot tem Pokémon */}
          <div className="grid grid-cols-2 gap-4 mt-6 max-w-lg bg-[#1f1d28] border border-[#3a3846] rounded-xl p-4">
            {/* Apelido: ocupa as duas colunas */}
            <div className="col-span-2">
              <label className="block mb-1 text-sm text-[#8b93a7]">Apelido</label>
              <input
                className={fieldClass}
                maxLength={12}
                placeholder="Opcional"
                disabled={!selectedSpecies}
                value={current.nickname}
                onChange={(e) => updateSlot(selectedSlot, { nickname: e.target.value })}
                onBlur={(e) => syncShownNickname(selectedSlot, e.target.value)}
              />
            </div>

            {/* Nature: menu suspenso com as 25 opções */}
            <div>
              <label className="block mb-1 text-sm text-[#8b93a7]">Nature</label>
              <select
                className={fieldClass}
                disabled={!selectedSpecies}
                value={current.nature}
                onChange={(e) => updateSlot(selectedSlot, { nature: e.target.value })}
              >
                <option value="">Escolha...</option>
                {NATURES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Tera type: menu suspenso com as 19 opções */}
            <div>
              <label className="block mb-1 text-sm text-[#8b93a7]">Tera type</label>
              <select
                className={fieldClass}
                disabled={!selectedSpecies}
                value={current.teraType}
                onChange={(e) => updateSlot(selectedSlot, { teraType: e.target.value })}
              >
                <option value="">Escolha...</option>
                {TERA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
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


