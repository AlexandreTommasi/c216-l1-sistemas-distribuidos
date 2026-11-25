import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { atualizarTreino, criarTreino, listarTreinos, removerTreino } from '../services/treinos.js';

const DIAS = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function TreinoForm({ treino, onSalvo, onCancelar }) {
  const [nome, setNome] = useState(treino?.nome ?? '');
  const [diaSemana, setDiaSemana] = useState(treino?.dia_semana ? String(treino.dia_semana) : '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const payload = {
        nome,
        dia_semana: diaSemana ? Number(diaSemana) : null,
      };
      if (treino) {
        await atualizarTreino(treino.id, payload);
      } else {
        await criarTreino(payload);
      }
      onSalvo?.();
    } catch (err) {
      setErro(err.message);
      // nome e diaSemana NÃO são resetados: estado do formulário preservado no erro
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs text-zinc-400 mb-1" htmlFor="tf-nome">
          Nome
        </label>
        <input
          id="tf-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          maxLength={60}
          placeholder="Treino A"
          className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-brand"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-400 mb-1" htmlFor="tf-dia">
          Dia da semana (opcional)
        </label>
        <select
          id="tf-dia"
          value={diaSemana}
          onChange={(e) => setDiaSemana(e.target.value)}
          className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-brand"
        >
          <option value="">—</option>
          {DIAS.slice(1).map((d, i) => (
            <option key={d} value={i + 1}>
              {d}
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
          {salvando ? 'Salvando...' : treino ? 'Salvar' : 'Criar'}
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

export default function TreinosPage() {
  const [treinos, setTreinos] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [editando, setEditando] = useState(null);
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const t = await listarTreinos();
      setTreinos(t);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleRemover(id) {
    setErro(null);
    try {
      await removerTreino(id);
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  }

  function handleSalvo() {
    setCriando(false);
    setEditando(null);
    carregar();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="title-display text-3xl">Treinos</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Suas rotinas. Comece uma sessão direto daqui.
          </p>
        </div>
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
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Novo treino</h2>
          <TreinoForm onSalvo={handleSalvo} onCancelar={() => setCriando(false)} />
        </div>
      )}

      {carregando && <p className="text-zinc-400">Carregando...</p>}

      {erro && (
        <div role="alert" className="border border-red-500/30 bg-red-500/10 rounded-xl p-4 mb-4">
          <p className="text-red-300 mb-2">{erro}</p>
          <button type="button" onClick={carregar} className="text-sm text-red-300 underline">
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && !erro && treinos !== null && (
        <>
          {treinos.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-zinc-500">
              Nenhum treino cadastrado. Clique em &quot;+ Novo&quot; para adicionar.
            </p>
          )}
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {treinos.map((t) => (
              <li key={t.id}>
                {editando?.id === t.id ? (
                  <div className="rounded-2xl border border-line bg-surface p-4">
                    <TreinoForm
                      treino={t}
                      onSalvo={handleSalvo}
                      onCancelar={() => setEditando(null)}
                    />
                  </div>
                ) : (
                  <div className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand/40">
                    <div className="flex items-start gap-3">
                      <span className="title-display flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-2xl text-brand">
                        {t.nome.trim().charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="title-display truncate text-xl text-zinc-100">{t.nome}</p>
                        {t.dia_semana ? (
                          <span className="mt-1 inline-block rounded-full border border-line px-2 py-0.5 text-[11px] text-zinc-400">
                            {DIAS[t.dia_semana]}
                          </span>
                        ) : (
                          <span className="mt-1 inline-block text-[11px] text-zinc-600">
                            Sem dia fixo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 border-t border-line pt-3">
                      <Link
                        to={`/sessoes/nova?treino=${t.id}`}
                        className="mr-auto rounded-lg px-2 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/10"
                      >
                        Iniciar sessão →
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEditando(t);
                          setCriando(false);
                        }}
                        className="rounded-lg px-2.5 py-2 text-xs text-zinc-400 transition-colors hover:bg-surface-2 hover:text-zinc-100"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemover(t.id)}
                        aria-label={`Excluir ${t.nome}`}
                        className="rounded-lg px-2.5 py-2 text-xs text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        Excluir
                      </button>
                    </div>
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
