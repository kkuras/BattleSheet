import { createClient } from "@/utils/supabase/server";

export default async function TimesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .eq("user_id", user!.id);

  return (
    <div>
      <h1>Meus Times</h1>

      {teams && teams.length > 0 ? (
        <ul className="flex flex-col gap-2 mt-4">
          {teams.map((team) => (
            <li key={team.id} className="border border-[#232b3d] rounded px-4 py-3">
              {team.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#8b93a7] mt-4">
          Você ainda não criou nenhum time.
        </p>
      )}
    </div>
  );
}