export type PokemonOption = {
  id: number;
  name: string;
  sprite: string;
};

export async function getPokemonList(): Promise<PokemonOption[]> {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000", {
        next: { revalidate: 60 * 60 *24},
    });

    if(!res.ok) {
        return [];
    }

    const data: { results: { name: string; url: string }[] } = await res.json();

    return data.results.map((p) => {
        const id = Number(p.url.split("/").filter(Boolean).pop());


        return {
            id,
            name: p.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        };
    });
}

// Deixa o texto em minúsculo e troca hífen por espaço, para "mr mime" achar "mr-mime"
export function normalizeName(text: string) {
  return text.toLowerCase().replace(/-/g, " ").trim();
}