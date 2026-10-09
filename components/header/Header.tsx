import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import ProfileMenu from "../ProfileMenu/ProfileMenu";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const username = user?.user_metadata?.username ?? null;

  return (
    <header className="border-b border-[#232b3d] px-6 py-4">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-[#f3c642]">
            BattleSheet
          </Link>
          <Link href="/times" className="text-sm text-[#8b93a7] hover:text-[#f3c642]">
            Meus Times
          </Link>
        </div>

        <ProfileMenu username={username} email={user?.email ?? null} />
      </nav>
    </header>
  );
}