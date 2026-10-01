"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ProfileMenu({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!email) {
    return (
      <Link href="/login" className="text-sm text-[#8b93a7] hover:text-[#f3c642]">
        Entrar
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-[#f3c642] text-[#0a0e17] font-semibold flex items-center justify-center"
      >
        {email.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[#2c2a38] border border-[#3a3846] rounded shadow-lg flex flex-col py-1">
          <span className="px-4 py-2 text-xs text-[#8b93a7] truncate">{email}</span>

          <Link
            href="/perfil"
            className="px-4 py-2 text-sm hover:bg-[#3a3846]"
            onClick={() => setOpen(false)}
          >
            Meu Perfil
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-left text-[#f87171] hover:bg-[#3a3846]"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}