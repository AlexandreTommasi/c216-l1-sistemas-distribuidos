import { useCallback, useEffect, useState } from 'react';
import ExercicioForm, { GRUPOS } from '../components/ExercicioForm.jsx';
import { listarExercicios, removerExercicio } from '../services/exercicios.js';

export default function ExerciciosPage() {
  const [exercicios, setExercicios] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [editando, setEditando] = useState(null);
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(async (grupo) => {
    setCarregando(true);
    setErro(null);
    try {
      const ex = await listarExercicios(grupo || null);
      setExercicios(ex);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar(filtroGrupo);
  }, [carregar, filtroGrupo]);

  async function handleRemover(id) {
    setErro(null);
    try {
      await removerExercicio(id);
      carregar(filtroGrupo);
    } catch (err) {
      setErro(err.message);
    }
  }

  function handleSalvo() {
    setCriando(false);
    setEditando(null);
    carregar(filtroGrupo);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Exercícios</h1>
        <button
          type="button"
          onClick={() => {
            setCriando(true);
            setEditando(null);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Novo
        </button>
      </div>

      {criando && (
        <div className="bg-zinc-800 rounded-xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Novo exercício</h2>
          <ExercicioForm onSalvo={handleSalvo} onCancelar={() => setCriando(false)} />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs text-zinc-400 mb-1" htmlFor="filtro-grupo">
          Filtrar por grupo
        </label>
        <select
          id="filtro-grupo"
          value={filtroGrupo}
          onChange={(e) => setFiltroGrupo(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
        >
          <option value="">Todos</option>
          {GRUPOS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {carregando && <p className="text-zinc-400">Carregando...</p>}

      {erro && (
        <div role="alert" className="bg-red-900/40 border border-red-700 rounded-lg p-4 mb-4">
          <p className="text-red-300 mb-2">{erro}</p>
          <button
            type="button"
            onClick={() => carregar(filtroGrupo)}
            className="text-sm text-red-300 underline"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && !erro && exercicios !== null && (
        <>
          {exercicios.length === 0 && (
            <p className="text-zinc-500 text-sm py-8 text-center">
              {filtroGrupo
                ? `Nenhum exercício em "${filtroGrupo}".`
                : 'Nenhum exercício cadastrado. Clique em "+ Novo" para adicionar.'}
            </p>
          )}
          <ul className="space-y-2">
            {exercicios.map((ex) => (
              <li key={ex.id}>
                {editando?.id === ex.id ? (
                  <div className="bg-zinc-800 rounded-xl p-4">
                    <ExercicioForm
                      exercicio={ex}
                      onSalvo={handleSalvo}
                      onCancelar={() => setEditando(null)}
                    />
                  </div>
                ) : (
                  <div className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-100 truncate">{ex.nome}</p>
                      <p className="text-xs text-zinc-500">{ex.grupo_muscular}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditando(ex);
                        setCriando(false);
                      }}
                      className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-1 min-h-[44px]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemover(ex.id)}
                      className="text-xs text-zinc-600 hover:text-red-400 transition-colors px-2 py-1 min-h-[44px]"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
