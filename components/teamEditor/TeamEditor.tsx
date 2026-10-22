"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { PokemonOption } from "@/lib/pokeapi";
import {
  NATURES,
  TERA_TYPES,
  GENDER_OPTIONS,
  STATS,
  STAT_RULES,
  defaultEvs,
  defaultIvs,
  evTotal,
  type StatKey,
  type StatSpread,
} from "@/lib/pokemonData";
import PokemonCombobox from "./PokemonCombobox";

// Um Pokémon que já está salvo no banco (vem da página /times/[id]); campos opcionais podem vir null
type SlotPokemon = {
  id: string;
  slot: number;
  species: string;
  nickname: string | null;
  nature: string | null;
  tera_type: string | null;
  gender: string | null;
  evs: Partial<StatSpread> | null;
  ivs: Partial<StatSpread> | null;
};

// Os dados de um slot enquanto você edita; texto vazio ("") significa "não preenchido"
type SlotData = {
  species: string;
  nickname: string; // o que está no campo agora (é o que vai para o banco)
  shownNickname: string; // o apelido exibido na lista de slots (só atualiza ao sair do campo)
  nature: string;
  teraType: string;
  gender: string;
  evs: StatSpread;
  ivs: StatSpread;
  // quando adicionar item, moves etc., as chaves novas entram aqui
};

type TeamEditorProps = {
  teamId: string;
  pokemons: SlotPokemon[];
  pokemonOptions: PokemonOption[];
};

const SLOTS = [1, 2, 3, 4, 5, 6];

// Estilo compartilhado dos campos de texto e menus; o disabled: deixa o campo apagado
const fieldClass =
  "w-full bg-[#2c2a38] border border-[#4a4757] rounded px-3 py-2 text-[#e8eaed] focus:outline-none focus:border-[#f3c642] disabled:opacity-40 disabled:cursor-not-allowed";

// Estilo dos campos numéricos de EV e IV: padding menor e texto centralizado, para caberem 6 por linha
const numberFieldClass =
  "w-full min-w-0 bg-[#2c2a38] border border-[#4a4757] rounded px-1 py-2 text-center text-[#e8eaed] focus:outline-none focus:border-[#f3c642] disabled:opacity-40 disabled:cursor-not-allowed";

// Monta o estado dos 6 slots a partir do que veio do banco (null vira texto vazio, {} vira o padrão)
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
      gender: found?.gender ?? "",
      // o que falta no banco é completado com o valor padrão
      evs: { ...defaultEvs(), ...(found?.evs ?? {}) },
      ivs: { ...defaultIvs(), ...(found?.ivs ?? {}) },
    };
  }

  return result;
}

// Compara dois conjuntos de EVs ou IVs, stat por stat
function sameSpread(a: StatSpread, b: StatSpread) {
  return STATS.every((s) => a[s.key] === b[s.key]);
}

// Compara dois slots; num slot vazio, só importa que os dois estão vazios
function sameSlot(a: SlotData, b: SlotData) {
  if (a.species !== b.species) return false;
  if (a.species === "") return true;

  return (
    a.nickname.trim() === b.nickname.trim() &&
    a.nature === b.nature &&
    a.teraType === b.teraType &&
    a.gender === b.gender &&
    sameSpread(a.evs, b.evs) &&
    sameSpread(a.ivs, b.ivs)
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

  // Regras de EV e IV do modo atual (por enquanto só o Showdown)
  const rules = STAT_RULES.showdown;

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

  // Esvazia um slot: remove o Pokémon e zera todos os campos dele
  function clearSlot(slot: number) {
    updateSlot(slot, {
      species: "",
      nickname: "",
      shownNickname: "",
      nature: "",
      teraType: "",
      gender: "",
      evs: defaultEvs(),
      ivs: defaultIvs(),
    });
  }

  // Devolve o sprite pelo nome; fica undefined se o nome não está na lista da PokéAPI
  function getSprite(species: string) {
    return pokemonOptions.find((o) => o.name === species)?.sprite;
  }

  // Dados do slot que está aberto no painel da direita
  const current = slots[selectedSlot];
  const selectedSpecies = current.species;
  const selectedSprite = getSprite(selectedSpecies);

  // Troca o EV de um stat respeitando o limite por stat e o limite total
  function setEv(stat: StatKey, raw: string) {
    const typed = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(typed)) return;

    // O que os outros stats já gastam; o que sobra do total é o teto deste campo
    const othersTotal = evTotal(current.evs) - current.evs[stat];
    const max = Math.min(rules.evMaxPerStat, rules.evMaxTotal - othersTotal);
    const value = Math.max(0, Math.min(Math.floor(typed), max));

    updateSlot(selectedSlot, { evs: { ...current.evs, [stat]: value } });
  }

  // Troca o IV de um stat, sempre entre 0 e o máximo
  function setIv(stat: StatKey, raw: string) {
    const typed = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(typed)) return;

    const value = Math.max(0, Math.min(Math.floor(typed), rules.ivMax));

    updateSlot(selectedSlot, { ivs: { ...current.ivs, [stat]: value } });
  }

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
        nickname: slots[slot].nickname.trim() || null,
        nature: slots[slot].nature || null,
        tera_type: slots[slot].teraType || null,
        gender: slots[slot].gender || null,
        evs: slots[slot].evs,
        ivs: slots[slot].ivs,
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

                {/* Textos: número do slot e o nome mostrado (apelido, se tiver; senão a espécie) */}
                <div>
                  <span>Slot {slot}</span>
                  <span className="block">
                    {(species && (nickname || species)) || "Vazio"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Painel de edição (coluna da direita): edita o slot selecionado */}
        <div className="bg-[#2c2a38] border border-[#3a3846] rounded-xl p-6">
          <h2>Slot {selectedSlot}</h2>

          {/* Rótulo do campo de Pokémon; block faz ele ocupar a linha toda, em cima do campo */}
          <label className="block mt-4 mb-1 text-sm text-[#8b93a7]">Pokémon</label>   {/* não muda */}

          {/* Campo pesquisável; o key reinicia o campo sempre que o Pokémon escolhido muda (trocar de slot, escolher ou remover) */}
          <PokemonCombobox
            key={`${selectedSlot}-${selectedSpecies}`}
            options={pokemonOptions}
            value={selectedSpecies}
            onChange={(name) =>
              name === ""
                ? clearSlot(selectedSlot)
                : updateSlot(selectedSlot, { species: name })
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
              
                {/* Botão para esvaziar o slot; o visual é com você */}
                <button className="bg-[#1f1d28] border border-[#3a3846]" 
                type="button" onClick={() => clearSlot(selectedSlot)}>
                  Remover Pokémon
                </button>
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
                onChange={(e) =>
                  updateSlot(selectedSlot, { nickname: e.target.value })
                }
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
                onChange={(e) =>
                  updateSlot(selectedSlot, { nature: e.target.value })
                }
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
                onChange={(e) =>
                  updateSlot(selectedSlot, { teraType: e.target.value })
                }
              >
                <option value="">Escolha...</option>
                {TERA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Sexo: dois botões; clicar no que já está marcado desmarca */}
            <div className="col-span-2">
              <label className="block mb-1 text-sm text-[#8b93a7]">Sexo</label>

              {/* Fileira com os dois botões, dividindo a largura */}
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((g) => {
                  const active = current.gender === g.value;

                  return (
                    <button
                      key={g.value}
                      type="button"
                      disabled={!selectedSpecies}
                      onClick={() =>
                        updateSlot(selectedSlot, { gender: active ? "" : g.value })
                      }
                      className={`flex-1 rounded border px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                        active
                          ? "bg-[#3a3846] border-[#f3c642]" /* marcado */
                          : "border-[#4a4757]" /* não marcado */
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Caixa de EVs e IVs: sempre visível, editável só com Pokémon escolhido */}
          <div className="mt-6 max-w-xl bg-[#1f1d28] border border-[#3a3846] rounded-xl p-4">
            {/* Cabeçalho: "EVs" sobre o slider e o número dos EVs, "IVs" sobre os dos IVs */}
            <div className="grid grid-cols-[3rem_minmax(0,1fr)_4rem_minmax(0,1fr)_4rem] gap-3 items-center mb-2">
              <span />
              <span className="col-span-2 text-sm text-[#8b93a7]">EVs</span>
              <span className="col-span-2 text-sm text-[#8b93a7]">IVs</span>
            </div>

            {/* Uma linha por stat: nome, slider e número de EV, slider e número de IV */}
            <div className="flex flex-col gap-2">
              {STATS.map((s) => (
                <div
                  key={s.key}
                  className="grid grid-cols-[3rem_minmax(0,1fr)_4rem_minmax(0,1fr)_4rem] gap-3 items-center"
                >
                  {/* Nome do stat */}
                  <span className="text-sm text-[#8b93a7]">{s.label}</span>

                  {/* Slider de EV: anda de 4 em 4 e trava no que sobra do total */}
                  <input
                    type="range"
                    min={0}
                    max={rules.evMaxPerStat}
                    step={4}
                    className="w-full accent-[#f3c642] disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={!selectedSpecies}
                    value={current.evs[s.key]}
                    onChange={(e) => setEv(s.key, e.target.value)}
                  />

                  {/* Número de EV: aceita qualquer valor dentro do limite */}
                  <input
                    type="number"
                    min={0}
                    max={rules.evMaxPerStat}
                    className={numberFieldClass}
                    disabled={!selectedSpecies}
                    value={current.evs[s.key]}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setEv(s.key, e.target.value)}
                  />

                  {/* Slider de IV */}
                  <input
                    type="range"
                    min={0}
                    max={rules.ivMax}
                    step={1}
                    className="w-full accent-[#f3c642] disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={!selectedSpecies}
                    value={current.ivs[s.key]}
                    onChange={(e) => setIv(s.key, e.target.value)}
                  />

                  {/* Número de IV */}
                  <input
                    type="number"
                    min={0}
                    max={rules.ivMax}
                    className={numberFieldClass}
                    disabled={!selectedSpecies}
                    value={current.ivs[s.key]}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setIv(s.key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Contador de EVs usados em relação ao total permitido */}
            <p className="mt-3 text-sm text-[#8b93a7]">
              EVs usados: {evTotal(current.evs)} / {rules.evMaxTotal}
            </p>
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


