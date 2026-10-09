"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function NovoTimePage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("O nome do time precisa ter pelo menos 2 caracteres.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?aviso=protegido");
      return;
    }

    const { error: insertError } = await supabase
      .from("teams")
      .insert({ name: name.trim(), user_id: user.id });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/times");
    router.refresh();
  }

  return (
    <div className="max-w-sm">
      <Link href="/times" className="text-sm text-[#8b93a7]">
        ← Voltar
      </Link>

      <h1 className="mt-4">Novo time</h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 mt-4">
        <div>
          <label className="block text-sm text-[#8b93a7] mb-1">Nome do time</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full bg-[#0a0e17] border rounded px-3 py-2 text-[#e8eaed] focus:outline-none ${
              error
                ? "border-[#f87171] focus:border-[#f87171]"
                : "border-[#232b3d] focus:border-[#f3c642]"
            }`}
          />
          {error && <p className="text-xs text-[#f87171] mt-1">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#f3c642] text-[#0a0e17] font-semibold rounded px-3 py-2 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-[#0a0e17]/30 border-t-[#0a0e17] rounded-full animate-spin" />
          )}
          {loading ? "Criando..." : "Criar time"}
        </button>
      </form>
    </div>
  );
}