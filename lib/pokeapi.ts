export type PokemonOption = {
  id: number;
  name: string;
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
      const id = Number(p.url.split("/").filter(Boolean).pop());   // não muda

      return { id, name: p.name };
    });
}

// Deixa o texto em minúsculo e troca hífen por espaço, para "mr mime" achar "mr-mime"
export function normalizeName(text: string) {
  return text.toLowerCase().replace(/-/g, " ").trim();
}

// Sexos que um Pokémon pode ter: ["M", "F"], ["M"], ["F"] ou [] (sem sexo)
export type AllowedGenders = ("M" | "F")[];

// Guarda a consulta de cada Pokémon, para não pedir duas vezes à PokéAPI
const allowedGendersCache = new Map<string, Promise<AllowedGenders | null>>();

// Faz as duas consultas: o Pokémon (que pode ser uma forma) aponta para a espécie, e a espécie tem o gender_rate
async function fetchAllowedGenders(name: string): Promise<AllowedGenders | null> {
  try {
    const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!pokemonRes.ok) return null;
    const pokemon: { species: { url: string } } = await pokemonRes.json();

    const speciesRes = await fetch(pokemon.species.url);
    if (!speciesRes.ok) return null;
    const species: { gender_rate: number } = await speciesRes.json();

    // gender_rate: -1 = sem sexo, 0 = sempre macho, 8 = sempre fêmea, 1 a 7 = os dois
    if (species.gender_rate === -1) return [];
    if (species.gender_rate === 0) return ["M"];
    if (species.gender_rate === 8) return ["F"];
    return ["M", "F"];
  } catch {
    return null;
  }
}

// Devolve os sexos permitidos de um Pokémon; null se a PokéAPI falhou
export function getAllowedGenders(name: string): Promise<AllowedGenders | null> {
  const cached = allowedGendersCache.get(name);
  if (cached) return cached;

  const request = fetchAllowedGenders(name);
  allowedGendersCache.set(name, request);

  // Se falhou, esquece a resposta para tentar de novo na próxima vez
  request.then((allowed) => {
    if (allowed === null) allowedGendersCache.delete(name);
  });

  return request;
}

const SPRITES_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

// Imagens para tentar, em ordem: HOME (3D, a mais moderna), arte oficial e, por último, o sprite pixelado
export function spriteSources(id: number, gender = ""): string[] {
  const home = `${SPRITES_BASE}/other/home/${id}.png`;
  const homeFemale = `${SPRITES_BASE}/other/home/female/${id}.png`;
  const artwork = `${SPRITES_BASE}/other/official-artwork/${id}.png`;
  const pixel = `${SPRITES_BASE}/${id}.png`;

  // Com sexo F tenta primeiro a versão feminina (que só existe para algumas espécies)
  return gender === "F" ? [homeFemale, home, artwork, pixel] : [home, artwork, pixel];
}