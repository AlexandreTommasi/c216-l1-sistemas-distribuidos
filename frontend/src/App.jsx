import { useState } from "react";
import PokemonForm from "./components/PokemonForm";
import PokemonList from "./components/PokemonList";

export default function App() {
  const [pokemons, setPokemons] = useState([]);

  // Na Prática 7, esta função chamará POST /pokemon no backend.
  function addPokemon(pokemon) {
    setPokemons((atuais) => [...atuais, pokemon]);
  }

  return (
    <div className="min-h-screen bg-stone-300 px-3 py-4 sm:px-6 sm:py-8">
      <main className="mx-auto max-w-2xl overflow-hidden rounded-2xl border-4 border-red-900 bg-stone-100 shadow-2xl">
        <header className="flex items-center gap-4 border-b-4 border-red-900 bg-red-600 px-4 py-4 sm:px-6">
          <span
            aria-hidden="true"
            className="relative h-12 w-12 shrink-0 rounded-full border-4 border-white bg-sky-300 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.25),0_0_12px_rgba(125,211,252,0.8)] after:absolute after:top-1.5 after:left-2 after:h-3 after:w-3 after:rounded-full after:bg-white/70"
          />
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full border border-red-950 bg-red-300" />
            <span className="h-3 w-3 rounded-full border border-yellow-700 bg-yellow-300" />
            <span className="h-3 w-3 rounded-full border border-green-900 bg-green-400" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white uppercase drop-shadow sm:text-3xl">
            Pokédex
          </h1>
        </header>

        <div className="space-y-8 p-4 sm:p-6">
          <section aria-labelledby="form-title">
            <h2
              id="form-title"
              className="mb-4 text-lg font-extrabold text-stone-800 uppercase"
            >
              Cadastrar pokémon
            </h2>
            <PokemonForm onAdd={addPokemon} />
          </section>

          <section aria-labelledby="list-title">
            <h2
              id="list-title"
              className="mb-4 text-lg font-extrabold text-stone-800 uppercase"
            >
              Pokémon cadastrados
            </h2>
            <PokemonList pokemons={pokemons} />
          </section>
        </div>
      </main>
    </div>
  );
}
