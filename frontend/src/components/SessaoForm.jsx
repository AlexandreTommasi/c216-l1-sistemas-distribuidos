import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { isoLocal } from '../lib/formatters.js';
import { criarSessao } from '../services/sessoes.js';
import { listarTreinos } from '../services/treinos.js';
import { dataNaoFutura } from '../validation.js';

function diasAtrasIso(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoLocal(d);
}

const ATALHOS = [
  { rotulo: 'Hoje', dias: 0 },
  { rotulo: 'Ontem', dias: 1 },
];

const CAMPO =
  'w-full rounded-xl border border-line bg-surface-2 px-3 py-3 text-zinc-100 focus:border-brand focus:outline-none';

export default function SessaoForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [treinos, setTreinos] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);

  const [treinoId, setTreinoId] = useState('');
  const [data, setData] = useState(isoLocal());
  const [salvando, setSalvando] = useState(false);
  const [erroEscrita, setErroEscrita] = useState(null);

  const carregarTreinos = useCallback(async () => {
    setCarregando(true);
    setErroCarregamento(null);
    try {
      const t = await listarTreinos();
      setTreinos(t);
      const pedido = params.get('treino');
      const inicial = t.find((x) => String(x.id) === pedido) ?? t[0];
      if (inicial) setTreinoId(String(inicial.id));
    } catch (err) {
      setErroCarregamento(err.message);
    } finally {
      setCarregando(false);
    }
  }, [params]);

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
      <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="mb-2 text-red-300">{erroCarregamento}</p>
        <button type="button" onClick={carregarTreinos} className="text-sm text-red-200 underline">
          Tentar de novo
        </button>
      </div>
    );
  }

  if (treinos?.length === 0) {
    return (
      <p className="text-zinc-400">
        Você não tem treinos cadastrados. Crie um em{' '}
        <Link to="/treinos" className="text-brand underline">
          Treinos
        </Link>{' '}
        antes de registrar uma sessão.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          className="mb-1.5 block text-[11px] uppercase tracking-widest text-zinc-500"
          htmlFor="sf-treino"
        >
          Treino
        </label>
        <select
          id="sf-treino"
          value={treinoId}
          onChange={(e) => setTreinoId(e.target.value)}
          required
          className={`${CAMPO} title-display text-lg`}
        >
          {treinos?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="mb-1.5 block text-[11px] uppercase tracking-widest text-zinc-500"
          htmlFor="sf-data"
        >
          Data
        </label>
        <div className="mb-2 flex gap-2">
          {ATALHOS.map(({ rotulo, dias }) => {
            const valor = diasAtrasIso(dias);
            const ativo = data === valor;
            return (
              <button
                key={rotulo}
                type="button"
                onClick={() => setData(valor)}
                aria-pressed={ativo}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  ativo
                    ? 'border-brand bg-brand/15 text-brand'
                    : 'border-line text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {rotulo}
              </button>
            );
          })}
        </div>
        <input
          id="sf-data"
          type="date"
          value={data}
          max={isoLocal()}
          onChange={(e) => setData(e.target.value)}
          required
          className={`${CAMPO} [color-scheme:dark]`}
        />
      </div>

      {erroEscrita && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm text-red-300">{erroEscrita}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={salvando || !treinoId}
        className="glow-brand w-full rounded-xl bg-brand py-3.5 font-semibold text-ink transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {salvando ? 'Salvando...' : 'Criar sessão'}
      </button>
    </form>
  );
}
