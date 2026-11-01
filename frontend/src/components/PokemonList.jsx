import { getTypeStyle } from "../typeStyles";

function formatNumero(numero) {
  return `#${String(numero).padStart(3, "0")}`;
}

export default function PokemonList({ pokemons }) {
  if (pokemons.length === 0) {
    return (
      <p className="rounded-lg border-2 border-dashed border-stone-400 bg-stone-100 p-6 text-center text-stone-600">
        Nenhum pokémon cadastrado.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {pokemons.map((pokemon) => (
        <li
          key={pokemon.numero}
          className="rounded-xl border-2 border-stone-300 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-500 hover:shadow-md"
        >
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-2xl font-black text-red-600">
              {formatNumero(pokemon.numero)}
            </span>
            <span className="text-xl font-extrabold break-words text-stone-900">
              {pokemon.nome}
            </span>
          </div>
          <ul aria-label="Tipos" className="mt-3 flex flex-wrap gap-2">
            {pokemon.tipos.map((tipo) => (
              <li
                key={tipo}
                className={`rounded-full border-2 px-3 py-0.5 text-sm font-bold ${getTypeStyle(tipo).selected}`}
              >
                {tipo}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
