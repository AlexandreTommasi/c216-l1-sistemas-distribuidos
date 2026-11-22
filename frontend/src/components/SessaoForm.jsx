import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataNaoFutura } from '../validation.js';
import { criarSessao } from '../services/sessoes.js';
import { listarTreinos } from '../services/treinos.js';

export default function SessaoForm() {
  const navigate = useNavigate();
  const [treinos, setTreinos] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);

  const [treinoId, setTreinoId] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [salvando, setSalvando] = useState(false);
  const [erroEscrita, setErroEscrita] = useState(null);

  const carregarTreinos = useCallback(async () => {
    setCarregando(true);
    setErroCarregamento(null);
    try {
      const t = await listarTreinos();
      setTreinos(t);
      if (t.length > 0) setTreinoId(String(t[0].id));
    } catch (err) {
      setErroCarregamento(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarTreinos();
  }, [carregarTreinos]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!dataNaoFutura(data)) {
      setErroEscrita('A data não pode ser futura.');
      return;
    }
    setSalvando(true);
    setErroEscrita(null);
    try {
      const sessao = await criarSessao({ treino_id: Number(treinoId), data });
      navigate(`/sessoes/${sessao.id}`);
    } catch (err) {
      setErroEscrita(err.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p className="text-zinc-400">Carregando treinos...</p>;
  }

  if (erroCarregamento) {
    return (
      <div role="alert" className="bg-red-900/40 border border-red-700 rounded-lg p-4">
        <p className="text-red-300 mb-2">{erroCarregamento}</p>
        <button type="button" onClick={carregarTreinos} className="text-sm text-red-300 underline">
          Tentar de novo
        </button>
      </div>
    );
  }

  if (treinos?.length === 0) {
    return (
      <p className="text-zinc-400">
        Você não tem treinos cadastrados. Crie um em{' '}
        <a href="/treinos" className="text-emerald-400 underline">
          Treinos
        </a>{' '}
        antes de registrar uma sessão.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-zinc-400 mb-1" htmlFor="sf-treino">
          Treino
        </label>
        <select
          id="sf-treino"
          value={treinoId}
          onChange={(e) => setTreinoId(e.target.value)}
          required
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
        >
          {treinos?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1" htmlFor="sf-data">
          Data
        </label>
        <input
          id="sf-data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {erroEscrita && (
        <div role="alert" className="bg-red-900/40 border border-red-700 rounded-lg p-3">
          <p className="text-red-300 text-sm">{erroEscrita}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={salvando || !treinoId}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg"
      >
        {salvando ? 'Salvando...' : 'Criar sessão'}
      </button>
    </form>
  );
}
