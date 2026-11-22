import { useState } from 'react';
import { atualizarExercicio, criarExercicio } from '../services/exercicios.js';

export const GRUPOS = [
  'peito',
  'costas',
  'pernas',
  'ombros',
  'biceps',
  'triceps',
  'abdomen',
  'panturrilha',
];

export default function ExercicioForm({ exercicio, onSalvo, onCancelar }) {
  const [nome, setNome] = useState(exercicio?.nome ?? '');
  const [grupo, setGrupo] = useState(exercicio?.grupo_muscular ?? GRUPOS[0]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      if (exercicio) {
        await atualizarExercicio(exercicio.id, { nome, grupo_muscular: grupo });
      } else {
        await criarExercicio({ nome, grupo_muscular: grupo });
      }
      onSalvo?.();
    } catch (err) {
      setErro(err.message);
      // nome e grupo NÃO são resetados: estado do formulário preservado no erro
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs text-zinc-400 mb-1" htmlFor="ef-nome">
          Nome
        </label>
        <input
          id="ef-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          maxLength={80}
          placeholder="Supino Reto"
          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1" htmlFor="ef-grupo">
          Grupo muscular
        </label>
        <select
          id="ef-grupo"
          value={grupo}
          onChange={(e) => setGrupo(e.target.value)}
          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
        >
          {GRUPOS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <div role="alert" className="bg-red-900/40 border border-red-700 rounded-lg p-2">
          <p className="text-red-300 text-xs">{erro}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={salvando}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm"
        >
          {salvando ? 'Salvando...' : exercicio ? 'Salvar' : 'Criar'}
        </button>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
