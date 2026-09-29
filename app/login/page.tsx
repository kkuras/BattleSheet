"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from("users")
          .insert({ id: data.user.id, username });

        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }
      }
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex bg-[#1b2438] rounded-lg p-1 mb-8">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === "login"
                ? "bg-[#f3c642] text-[#0a0e17]"
                : "text-[#8b93a7]"
            }`}>
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === "signup"
                ? "bg-[#f3c642] text-[#0a0e17]"
                : "text-[#8b93a7]"
            }`}>
            Criar conta
          </button>
        </div>

        <h1>{mode === "login" ? "Entrar no BattleSheet" : "Criar conta"}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-start gap-4 mt-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xl text-[#8b93a7]">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0a0e17] border border-[#232b3d] rounded px-3 py-2 text-[#e8eaed] focus:outline-none focus:border-[#f3c642]"/>
            </div>
          )}

          <div>
            <label className="block text-xl text-[#8b93a7]">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0e17] border border-[#232b3d] rounded px-3 py-2 text-[#e8eaed] focus:outline-none focus:border-[#f3c642]"/>
          </div>

          <div>
            <label className="block text-xl text-[#8b93a7]">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0e17] border border-[#232b3d] rounded px-3 py-2 text-[#e8eaed] focus:outline-none focus:border-[#f3c642]"/>
          </div>

          {error && <p className="text-[#f87171] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#f3c642] text-[#0a0e17] font-semibold rounded px-3 py-2">
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}