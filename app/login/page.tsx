"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    console.log("Email digitado:", email);
    console.log("Senha digitada:", password);
  }

  return (
    <div>
      <h1>Entrar no BattleSheet</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}