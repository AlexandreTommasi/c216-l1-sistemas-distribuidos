import { useState } from 'react';
import { cargaPositiva } from '../validation.js';

const TIPOS = ['valida', 'aquecimento', 'preparatoria'];

export default function SerieForm({ exercicios, onSalvar }) {
  const [exercicioId, setExercicioId] = useState(
    exercicios.length > 0 ? String(exercicios[0].id) : '',
  );
  const [cargaKg, setCargaKg] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [tipo, setTipo] = useState('valida');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  if (exercicios.length === 0) {
    return (
      <p className="text-zinc-400 text-sm">
        Nenhum exercício cadastrado.{' '}
        <a href="/exercicios" className="text-emerald-400 underline">
          Cadastre exercícios
        </a>{' '}
        antes de registrar séries.
      </p>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const carga = Number.parseFloat(cargaKg);
    if (!cargaPositiva(carga)) {
      setErro('A carga deve ser maior que zero.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar({
        exercicio_id: Number(exercicioId),
        carga_kg: carga,
        repeticoes: Number(repeticoes),
        tipo,
      });
      setCargaKg('');
      setRepeticoes('');
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <h3 className="font-semibold text-zinc-100 mb-4">Adicionar série</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1" htmlFor="serie-exercicio">
            Exercício
          </label>
          <select
            id="serie-exercicio"
            value={exercicioId}
            onChange={(e) => setExercicioId(e.target.value)}
            required
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
          >
            {exercicios.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-zinc-400 mb-1" htmlFor="serie-carga">
              Carga (kg)
            </label>
            <input
              id="serie-carga"
              type="number"
              min="0.25"
              step="any"
              value={cargaKg}
              onChange={(e) => setCargaKg(e.target.value)}
              required
              placeholder="80"
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-zinc-400 mb-1" htmlFor="serie-reps">
              Repetições
            </label>
            <input
              id="serie-reps"
              type="number"
              min="1"
              max="100"
              step="1"
              value={repeticoes}
              onChange={(e) => setRepeticoes(e.target.value)}
              required
              placeholder="10"
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1" htmlFor="serie-tipo">
            Tipo
          </label>
          <select
            id="serie-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {erro && (
          <div role="alert" className="bg-red-900/40 border border-red-700 rounded-lg p-2">
            <p className="text-red-300 text-xs">{erro}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={salvando}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg text-sm"
        >
          {salvando ? 'Salvando...' : 'Registrar série'}
        </button>
      </form>
    </div>
  );
}
