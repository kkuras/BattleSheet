import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>BattleSheet</h1>
      <Link href="/login">
        <button className="bg-[#f3c642] text-[#0a0e17] px-4 py-2 rounded font-semibold">
          Entrar
          </button>
      </Link>

      <h2>como coco</h2>
    </div>
  );
}