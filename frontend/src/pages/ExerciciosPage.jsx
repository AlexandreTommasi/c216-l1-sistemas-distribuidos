import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ExercicioForm, { GRUPOS as CHAVES_GRUPO } from '../components/ExercicioForm.jsx';
import MuscleIcon from '../components/MuscleIcon.jsx';
import { titulo } from '../lib/formatters.js';
import { grupo } from '../lib/grupos.js';
import { listarExercicios, removerExercicio } from '../services/exercicios.js';

export default function ExerciciosPage() {
  const [exercicios, setExercicios] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [editando, setEditando] = useState(null);
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(async (chave) => {
    setCarregando(true);
    setErro(null);
    try {
      const ex = await listarExercicios(chave || null);
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="title-display text-3xl">Exercícios</h1>
        <button
          type="button"
          onClick={() => {
            setCriando(true);
            setEditando(null);
          }}
          className="glow-brand rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-ink"
        >
          + Novo
        </button>
      </div>

      {criando && (
        <div className="mb-6 rounded-2xl border border-line bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold text-zinc-300">Novo exercício</h2>
          <ExercicioForm onSalvo={handleSalvo} onCancelar={() => setCriando(false)} />
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFiltroGrupo('')}
          aria-pressed={filtroGrupo === ''}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            filtroGrupo === ''
              ? 'border-brand bg-brand/15 text-brand'
              : 'border-line text-zinc-400 hover:text-zinc-100'
          }`}
        >
          Todos
        </button>
        {CHAVES_GRUPO.map((chave) => {
          const g = grupo(chave);
          const ativo = filtroGrupo === chave;
          return (
            <button
              key={chave}
              type="button"
              onClick={() => setFiltroGrupo(chave)}
              aria-pressed={ativo}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
              style={{
                borderColor: ativo ? g.cor : 'var(--color-line)',
                backgroundColor: ativo ? `${g.cor}1f` : 'transparent',
                color: ativo ? g.cor : '#a1a1aa',
              }}
            >
              <MuscleIcon chave={chave} className="h-3.5 w-3.5" />
              {g.rotulo}
            </button>
          );
        })}
      </div>

      {carregando && <p className="text-zinc-400">Carregando...</p>}

      {erro && (
        <div role="alert" className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="mb-2 text-red-300">{erro}</p>
          <button
            type="button"
            onClick={() => carregar(filtroGrupo)}
            className="text-sm text-red-200 underline"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && !erro && exercicios !== null && (
        <>
          {exercicios.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-zinc-500">
              {filtroGrupo
                ? `Nenhum exercício em "${grupo(filtroGrupo).rotulo}".`
                : 'Nenhum exercício cadastrado. Clique em "+ Novo" para adicionar.'}
            </p>
          )}
          <ul className="grid gap-2 sm:grid-cols-2">
            {exercicios.map((ex) => {
              const g = grupo(ex.grupo_muscular);
              return (
                <li key={ex.id}>
                  {editando?.id === ex.id ? (
                    <div className="rounded-2xl border border-line bg-surface p-4">
                      <ExercicioForm
                        exercicio={ex}
                        onSalvo={handleSalvo}
                        onCancelar={() => setEditando(null)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition-colors hover:border-zinc-700">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ color: g.cor, backgroundColor: `${g.cor}1a` }}
                      >
                        <MuscleIcon chave={ex.grupo_muscular} className="h-5 w-5" />
                      </span>
                      <Link to={`/exercicios/${ex.id}`} className="min-w-0 flex-1">
                        <p className="truncate font-medium text-zinc-100">{titulo(ex.nome)}</p>
                        <p className="text-xs" style={{ color: g.cor }}>
                          {g.rotulo}
                        </p>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEditando(ex);
                          setCriando(false);
                        }}
                        className="rounded-lg px-2.5 py-2 text-xs text-zinc-400 transition-colors hover:bg-surface-2 hover:text-zinc-100"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemover(ex.id)}
                        aria-label={`Excluir ${ex.nome}`}
                        className="rounded-lg px-2.5 py-2 text-xs text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
