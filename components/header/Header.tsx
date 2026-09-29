import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[#232b3d] px-6 py-4">
      <nav className="flex items-center gap-6">
        <Link href="/" className="font-bold text-[#f3c642]">
          BattleSheet
        </Link>
        <Link href="/dashboard" className="text-sm text-[#8b93a7] hover:text-[#f3c642] transition-colors">
          Meus Times
        </Link>
        <Link href="/login" className="text-sm text-[#8b93a7]">
          Entrar
        </Link>
      </nav>
    </header>
  );
}