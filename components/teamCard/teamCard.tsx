"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type TeamCardProps = {
  id: string;
  name: string;
  pokemonCount: number;
};

export default function TeamCard({ id, name, pokemonCount }: TeamCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");

    const { error } = await supabase.from("teams").delete().eq("id", id);

    if (error) {
      setDeleteError(error.message);
      setDeleting(false);
      return;
    }

    setConfirmDelete(false);
    setDeleting(false);
    router.refresh();
  }

  async function handleRename() {
    const trimmed = newName.trim();

    if (trimmed.length < 2 || trimmed === name) {
      setRenaming(false);
      setNewName(name);
      return;
    }

    const { error } = await supabase
      .from("teams")
      .update({ name: trimmed })
      .eq("id", id);

    if (error) {
      setNewName(name);
      setRenaming(false);
      return;
    }

    setRenaming(false);
    router.refresh();
  }

  return (
    <div
      onClick={() => router.push(`/times/${id}`)}
      className="bg-[#2c2a38] border border-[#3a3846] rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:border-[#f3c642] transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        {renaming ? (
          <input
            autoFocus
            value={newName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") {
                setRenaming(false);
                setNewName(name);
              }
            }}
            onBlur={() => {
              setRenaming(false);
              setNewName(name);
            }}
            className="flex-1 min-w-0 bg-[#0a0e17] border border-[#f3c642] rounded px-2 py-1 text-sm focus:outline-none"
          />
        ) : (
          <h3 className="text-base font-semibold truncate">{name}</h3>
        )}

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="w-9 h-9 -mr-2 flex items-center justify-center rounded text-xl text-[#8b93a7] hover:text-[#f3c642] hover:bg-[#3a3846] transition-colors"
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-[#23212c] border border-[#3a3846] rounded shadow-lg flex flex-col py-1 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setRenaming(true);
                }}
                className="px-4 py-2 text-sm text-left hover:bg-[#3a3846]"
              >
                Renomear
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setConfirmDelete(true);
                }}
                className="px-4 py-2 text-sm text-left text-[#f87171] hover:bg-[#3a3846]"
              >
                Apagar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded bg-[#23212c] border border-[#3a3846] flex items-center justify-center text-xs text-[#8b93a7]"
          >
            {i < pokemonCount ? "?" : ""}
          </div>
        ))}
      </div>

      {confirmDelete && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!deleting) setConfirmDelete(false);
          }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 cursor-default"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#2c2a38] border border-[#3a3846] rounded-xl p-6"
          >
            <h3>Apagar time?</h3>
            <p className="text-sm text-[#8b93a7] mt-2">
              O time "{name}" e todos os Pokémon dele serão apagados. Essa ação não pode ser desfeita.
            </p>

            {deleteError && (
              <p className="text-xs text-[#f87171] mt-3">{deleteError}</p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="px-3 py-2 text-sm rounded text-[#8b93a7] hover:bg-[#3a3846] disabled:opacity-70"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-2 text-sm rounded font-semibold bg-[#f87171] text-[#0a0e17] flex items-center gap-2 disabled:opacity-70"
              >
                {deleting && (
                  <span className="w-4 h-4 border-2 border-[#0a0e17]/30 border-t-[#0a0e17] rounded-full animate-spin" />
                )}
                {deleting ? "Apagando..." : "Apagar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}