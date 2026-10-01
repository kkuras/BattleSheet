import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?aviso=protegido");
  }

  return (
    <div className="flex flex-1">
      <aside className="w-56 border-r border-[#232b3d] px-4 py-6 flex flex-col gap-2">
        <Link href="/times" className="text-sm text-[#8b93a7] hover:text-[#f3c642]">
          Meus Times
        </Link>
      </aside>

      <main className="flex-1 px-6 py-10">{children}</main>
    </div>
  );
}