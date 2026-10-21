import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getPokemonList } from "@/lib/pokeapi";
import TeamEditor from "@/components/teamEditor/TeamEditor";

export default async function TeamPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Busca o time pelo id da URL (o RLS garante que só o dono enxerga)
    const { data: team } = await supabase
        .from("teams")
        .select("id, name")
        .eq("id", id)
        .single();

    if (!team) {
        notFound();
    }

    // Pokémon já salvos nesse time, na ordem dos slots
    const { data: pokemons } = await supabase
        .from("team_pokemons")
        .select("id, slot, species, nickname, nature, tera_type, evs, ivs")
        .eq("team_id", team.id)
        .order("slot", { ascending: true });

    // Lista de Pokémon da PokéAPI (fica em cache no servidor por 24 horas)
    const pokemonOptions = await getPokemonList();


    return (
        <div>
            {/* Link para voltar à lista de times */}
            <Link href="/times" className="text-sm text-[#8b93a7]">
            ← Meus Times
            </Link>

            {/* Nome do time */}
            <h1 className="mt-4 text-4xl">{team.name}</h1>

            {/* Editor dos 6 slots, com salvamento do time inteiro */}
            <TeamEditor 
            teamId={team.id}
            pokemons={pokemons ?? []}
            pokemonOptions={pokemonOptions}
            />
        </div>
    );
}