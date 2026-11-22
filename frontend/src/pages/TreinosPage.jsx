import { useCallback, useEffect, useState } from 'react';
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
          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
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
          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
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
        <h1 className="text-xl font-bold">Treinos</h1>
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
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">Novo treino</h2>
          <TreinoForm onSalvo={handleSalvo} onCancelar={() => setCriando(false)} />
        </div>
      )}

      {carregando && <p className="text-zinc-400">Carregando...</p>}

      {erro && (
        <div role="alert" className="bg-red-900/40 border border-red-700 rounded-lg p-4 mb-4">
          <p className="text-red-300 mb-2">{erro}</p>
          <button type="button" onClick={carregar} className="text-sm text-red-300 underline">
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && !erro && treinos !== null && (
        <>
          {treinos.length === 0 && (
            <p className="text-zinc-500 text-sm py-8 text-center">
              Nenhum treino cadastrado. Clique em &quot;+ Novo&quot; para adicionar.
            </p>
          )}
          <ul className="space-y-2">
            {treinos.map((t) => (
              <li key={t.id}>
                {editando?.id === t.id ? (
                  <div className="bg-zinc-800 rounded-xl p-4">
                    <TreinoForm
                      treino={t}
                      onSalvo={handleSalvo}
                      onCancelar={() => setEditando(null)}
                    />
                  </div>
                ) : (
                  <div className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-100 truncate">{t.nome}</p>
                      {t.dia_semana && (
                        <p className="text-xs text-zinc-500">{DIAS[t.dia_semana]}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditando(t);
                        setCriando(false);
                      }}
                      className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-1 min-h-[44px]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemover(t.id)}
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
