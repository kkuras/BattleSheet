"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
};

export default function LoginPage() {

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const aviso = searchParams.get("aviso");
  const supabase = createClient();

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (mode === "signup" && username.trim().length < 3) {
      errors.username = "O nome de usuário precisa ter pelo menos 3 caracteres.";
    }

    if (!email.includes("@") || !email.includes(".")) {
      errors.email = "Digite um e-mail válido.";
    }

    if (password.length < 6) {
      errors.password = "A senha precisa ter pelo menos 6 caracteres.";
    }

    return errors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setFormError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setFormError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from("users")
          .insert({ id: data.user.id, username });

        if (profileError) {
          setFormError(profileError.message);
          setLoading(false);
          return;
        }
      }
    }

    router.push("/times");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-sm text-[#8b93a7]">
          ← Voltar
        </Link>

        <div className="flex bg-[#1b2438] rounded-lg p-1 mb-4 mt-4">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === "login" ? "bg-[#f3c642] text-[#0a0e17]" : "text-[#8b93a7]"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
              mode === "signup" ? "bg-[#f3c642] text-[#0a0e17]" : "text-[#8b93a7]"
            }`}
          >
            Criar conta
          </button>
        </div>

        {(aviso === "times" || formError) && (
          <div className="mb-4 animate-[fadeIn_0.2s_ease-in]">
            {aviso === "times" && !formError && (
              <p className="text-sm text-[#fb923c] bg-[#fb923c]/10 border border-[#fb923c]/30 rounded px-3 py-2">
                Faça login ou crie uma conta para acessar seus times.
              </p>
            )}
            {formError && (
              <p className="text-sm text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/30 rounded px-3 py-2">
                {formError}
              </p>
            )}
          </div>
        )}

        <h1>{mode === "login" ? "Entrar no BattleSheet" : "Criar conta"}</h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col items-start gap-4 mt-4">
          {mode === "signup" && (
            <div className="w-full">
              <label className="block text-sm text-[#8b93a7] mb-1">Nome de usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-[#0a0e17] border rounded px-3 py-2 text-[#e8eaed] focus:outline-none ${
                  fieldErrors.username
                    ? "border-[#f87171] focus:border-[#f87171]"
                    : "border-[#232b3d] focus:border-[#f3c642]"
                }`}
              />
              {fieldErrors.username && (
                <p className="text-xs text-[#f87171] mt-1">{fieldErrors.username}</p>
              )}
            </div>
          )}

          <div className="w-full">
            <label className="block text-sm text-[#8b93a7] mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-[#0a0e17] border rounded px-3 py-2 text-[#e8eaed] focus:outline-none ${
                fieldErrors.email
                  ? "border-[#f87171] focus:border-[#f87171]"
                  : "border-[#232b3d] focus:border-[#f3c642]"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-xs text-[#f87171] mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-sm text-[#8b93a7] mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-[#0a0e17] border rounded px-3 py-2 text-[#e8eaed] focus:outline-none ${
                fieldErrors.password
                  ? "border-[#f87171] focus:border-[#f87171]"
                  : "border-[#232b3d] focus:border-[#f3c642]"
              }`}
            />
            {fieldErrors.password && (
              <p className="text-xs text-[#f87171] mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#f3c642] text-[#0a0e17] font-semibold rounded px-3 py-2"
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}