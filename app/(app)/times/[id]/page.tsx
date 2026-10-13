import Link from "next/link";
import { getPokemonList } from "@/lib/pokeapi";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import TeamEditor from "@/components/teamEditor/TeamEditor";

export default async function TeamPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: team } = await supabase
        .from("teams")
        .select("id, name")
        .eq("id", id)
        .single();

    if (!team) {
        notFound();
    }

    const { data: pokemons } = await supabase
        .from("team_pokemons")
        .select("id, slot, species")
        .eq("team_id", team.id)
        .order("slot", { ascending: true });

    const pokemonOptions = await getPokemonList();


    return (
        <div>
            <Link href="/times" className="text-sm text-[#8b93a7]">
            ← Meus Times
            </Link>

            <h1 className="mt-4 text-4xl">{team.name}</h1>

            <TeamEditor pokemons={pokemons ?? []} pokemonOptions={pokemonOptions} />
        </div>
    );
}