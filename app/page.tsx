import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>BattleSheet</h1>
      <Link href="/login">
        <button>Entrar</button>
      </Link>
    </div>
  );
}