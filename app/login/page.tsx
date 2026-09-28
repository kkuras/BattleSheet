"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    console.log(mode, username, email, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-sm text-[#8b93a7]">
          ← Voltar
        </Link>
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

          <button
            type="submit"
            className="mt-2 bg-[#f3c642] text-[#0a0e17] font-semibold rounded px-3 py-2">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}