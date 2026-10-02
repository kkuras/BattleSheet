type TeamCardProps = {
  name: string;
  pokemonCount: number;
};

export default function TeamCard({ name, pokemonCount }: TeamCardProps) {
  return (
    <div className="bg-[#2c2a38] border border-[#3a3846] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{name}</h3>
        <button className="text-[#8b93a7] hover:text-[#f3c642] px-1">⋮</button>
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded bg-[#23212c] border border-[#3a3846] flex items-center justify-center text-xs text-[#8b93a7]"
          >
            {i < pokemonCount ? "?" : ""}
          </div>
        ))}
      </div>
    </div>
  );
}