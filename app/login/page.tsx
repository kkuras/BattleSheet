"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    console.log("Email digitado:", email);
    console.log("Senha digitada:", password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-sm text-[#8b93a7]">
          ← Voltar
        </Link>

        <h1>Entrar no BattleSheet</h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-start gap-4">
          <div>
            <label className="text-sm text-[#8b93a7]">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#0a0e17] border border-[#232b3d] rounded px-3 py-2 text-[#e8eaed] focus:outline-none focus:border-[#f3c642]"
            />
          </div>

          <div>
            <label className="text-sm text-[#8b93a7]">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0a0e17] border border-[#232b3d] rounded px-3 py-2 text-[#e8eaed] focus:outline-none focus:border-[#f3c642]"
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-[#f3c642] text-[#0a0e17] font-semibold rounded px-3 py-2"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}