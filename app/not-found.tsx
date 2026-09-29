import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-4 py-20">
      <h1>Página não encontrada</h1>
      <p className="text-sm text-[#8b93a7]">
        A página que você procurou não existe.
      </p>
      <Link href="/" className="text-[#f3c642] hover:underline">
        Voltar para a Home
      </Link>
    </div>
  );
}