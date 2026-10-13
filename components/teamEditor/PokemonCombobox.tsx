"use client";

import { useState } from "react";
import type { PokemonOption } from "@/lib/pokeapi";

type PokemonComboboxProps = {
    options: PokemonOption[];
    value: string;
    onChange: (value: string) => void;
};

function normalize(text: string) {
    return text.toLowerCase().replace(/-/g, " ").trim();
}

export default function PokemonComboboxProps ({
    options,
    value,
    onChange
}: PokemonComboboxProps) {
    const [open, setOpen] = useState(false);

    const query = normalize(value);

    const results = query
        ? options.filter((o) => normalize(o.name).includes(query)).slice(0, 8) 
        : [];


    return (
        <div className="relative">
            <input 
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                placeholder="Digite o nome do Pokemon"
                className="w-full bg-[#0a0e17] border border-[#232b3d] rounded px-3 py-2 text-[#e8eaed] focus:outline-none focus:border-[#f3c642]"
                />

                {open && query !== "" && (
                    <ul className="absolute left-0 right-0 top-full mt-1 bg-[#23212c] border border-[#3a3846] rounded shadow-lg z-10"> 
                    {results.length > 0 ? (
                        results.map((o) => (
                            <li key={o.id}>
                                <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    onChange(o.name);
                                    setOpen(false);
                                }} 
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-[#3a3846]">
                                    <img src={o.sprite} alt="" className="w-8 h-8"/>
                                    {o.name}
                                </button>
                            </li> 
                        ))
                    ) : (
                        <li className="px-3 py-2 text-xs text-[#8b93a7]">
                            Nenhum resultado. O nome digitado esta errado.
                        </li>
                    )}
                    </ul>
                )}
        </div>
    )
}