import { createClient } from "@/utils/supabase/server";
import TeamCard from "@/components/teamCard/teamCard";
import Link from "next/link";

export default async function TimesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1>Meus Times</h1>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {teams?.map((team) => (
          <TeamCard key={team.id} id={team.id} name={team.name} pokemonCount={0}/>
        ))}

        <Link href="/times/novo" className="self-start justify-self-start border border-dashed
        border-[#3a3846] rounded-xl px-5 py-3 flex items-center gap-2 
        text-sm text-[#8b93a7] hover:text-[#f3c642] hover:border-[#f3c642] transition-colors"> + Criar Novo Time</Link>
      </div>
    </div>
  );
}
