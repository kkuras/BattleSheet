import { createClient } from "@/utils/supabase/server";
import TeamCard from "@/components/teamCard/teamCard";
import Link from "next/link";
import { getPokemonList, spriteSources } from "@/lib/pokeapi";

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
    
  // Todos os Pokémon salvos nos times deste usuário, numa consulta só
const teamIds = (teams ?? []).map((t) => t.id);
let savedPokemons: { team_id: string; slot: number; species: string; gender: string | null }[] = [];

if (teamIds.length > 0) {
  const { data } = await supabase
    .from("team_pokemons")
    .select("team_id, slot, species, gender")
    .in("team_id", teamIds);

  savedPokemons = data ?? [];
}

// Lista de Pokémon da PokéAPI (fica em cache no servidor por 24 horas)   ← LINHA NOVA
const options = await getPokemonList();
// Tabela de consulta: nome do Pokémon -> número dele
const idByName = new Map(options.map((o) => [o.name, o.id] as const)); 

// Monta os 6 slots de um time já com o sprite resolvido (null = slot vazio)
function buildCardSlots(teamId: string) {
  return [1, 2, 3, 4, 5, 6].map((slot) => {
    const found = savedPokemons.find(
      (p) => p.team_id === teamId && p.slot === slot
    );

    if (!found) return null;

    const id = idByName.get(found.species);

    return {
      species: found.species,
      // lista de imagens para tentar, já com o sexo; null se o nome não está na lista
      sources: id ? spriteSources(id, found.gender ?? "") : null,
    };
  });
}
  
  

  return (
    <div>
      <h1>Meus Times</h1>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {teams?.map((team) => (
          <TeamCard
            key={team.id}
            id={team.id}
            name={team.name}
            slots={buildCardSlots(team.id)}
          />
        ))}

        <Link href="/times/novo" className="self-start justify-self-start border border-dashed
        border-[#3a3846] rounded-xl px-5 py-3 flex items-center gap-2 
        text-sm text-[#8b93a7] hover:text-[#f3c642] hover:border-[#f3c642] transition-colors"> + Criar Novo Time</Link>
      </div>
    </div>
  );
}
