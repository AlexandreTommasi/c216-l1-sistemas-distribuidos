import { useState } from "react";
import { getTypeStyle } from "../typeStyles";
import {
  NOME_MAX_LENGTH,
  TIPOS_DISPONIVEIS,
  validatePokemon,
} from "../validation";

const inputClass =
  "w-full rounded-lg border-2 bg-white px-3 py-2 text-stone-900 shadow-inner transition-colors placeholder:text-stone-400 hover:border-stone-500 focus:outline-none focus-visible:border-red-600 focus-visible:ring-4 focus-visible:ring-red-600/30 aria-[invalid=true]:border-red-700";

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm font-semibold text-red-700">
      {message}
    </p>
  );
}

export default function PokemonForm({ onAdd }) {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [tipos, setTipos] = useState([]);
  const [errors, setErrors] = useState({});

  function toggleTipo(tipo) {
    setTipos((atuais) =>
      atuais.includes(tipo)
        ? atuais.filter((t) => t !== tipo)
        : [...atuais, tipo],
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = validatePokemon({ numero, nome, tipos });
    setErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;

    onAdd(result.values);
    setNumero("");
    setNome("");
    setTipos([]);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="numero" className="mb-1 block font-bold text-stone-800">
          Número
        </label>
        <input
          id="numero"
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder="25"
          aria-invalid={errors.numero ? "true" : "false"}
          aria-describedby={errors.numero ? "numero-error" : undefined}
          className={inputClass}
        />
        <FieldError id="numero-error" message={errors.numero} />
      </div>

      <div>
        <label htmlFor="nome" className="mb-1 block font-bold text-stone-800">
          Nome
        </label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Pikachu"
          aria-invalid={errors.nome ? "true" : "false"}
          aria-describedby={errors.nome ? "nome-error" : undefined}
          className={inputClass}
        />
        <FieldError id="nome-error" message={errors.nome} />
        <p className="mt-1 text-xs text-stone-600">
          {nome.trim().length}/{NOME_MAX_LENGTH} caracteres
        </p>
      </div>

      <fieldset
        aria-describedby={errors.tipos ? "tipos-error" : undefined}
        className="min-w-0"
      >
        <legend className="mb-2 font-bold text-stone-800">Tipos</legend>
        <div className="flex flex-wrap gap-2">
          {TIPOS_DISPONIVEIS.map((tipo) => {
            const style = getTypeStyle(tipo);
            const selecionado = tipos.includes(tipo);
            return (
              <label key={tipo} className="relative cursor-pointer">
                <input
                  type="checkbox"
                  checked={selecionado}
                  onChange={() => toggleTipo(tipo)}
                  aria-invalid={errors.tipos ? "true" : "false"}
                  className="peer sr-only"
                />
                <span
                  className={`block rounded-full border-2 px-3 py-1 text-sm font-bold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md peer-focus-visible:ring-4 peer-focus-visible:ring-offset-2 ${style.ring} ${
                    selecionado
                      ? `${style.selected} shadow-md`
                      : `${style.chip} opacity-80 hover:opacity-100`
                  }`}
                >
                  {tipo}
                </span>
              </label>
            );
          })}
        </div>
        <FieldError id="tipos-error" message={errors.tipos} />
      </fieldset>

      <button
        type="submit"
        className="w-full rounded-lg border-b-4 border-red-900 bg-red-600 px-4 py-3 font-extrabold tracking-wide text-white uppercase shadow transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/40 focus-visible:ring-offset-2 active:translate-y-0.5 active:border-b-2 sm:w-auto"
      >
        Adicionar
      </button>
    </form>
  );
}
