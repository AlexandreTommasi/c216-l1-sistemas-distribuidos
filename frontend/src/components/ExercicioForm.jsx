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
          className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-brand"
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
          className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-brand"
        >
          {GRUPOS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <div role="alert" className="border border-red-500/30 bg-red-500/10 rounded-xl p-2">
          <p className="text-red-300 text-xs">{erro}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={salvando}
          className="flex-1 bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed text-ink font-semibold py-2.5 rounded-xl text-sm"
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
