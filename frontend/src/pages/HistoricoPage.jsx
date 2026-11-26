import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Heatmap from '../components/Heatmap.jsx';
import SessaoList from '../components/SessaoList.jsx';
import StatTile from '../components/StatTile.jsx';
import { dataRelativa, diasAtras } from '../lib/formatters.js';
import { listarSessoes } from '../services/sessoes.js';

const LIMITE = 20;

// Indicadores saem das sessoes ja carregadas: nenhuma requisicao extra so para
// montar o painel.
function resumo(sessoes) {
  if (!sessoes || sessoes.length === 0) return null;

  const semanaDe = (iso) => Math.floor(diasAtras(iso) / 7);
  const semanas = new Set(sessoes.map(semanaDe));

  let sequencia = 0;
  while (semanas.has(sequencia)) sequencia += 1;

  const ultimas4 = sessoes.filter((s) => semanaDe(s.data) < 4).length;

  return {
    ultimo: dataRelativa(sessoes[0].data),
    estaSemana: sessoes.filter((s) => semanaDe(s.data) === 0).length,
    sequencia,
    media: (ultimas4 / 4).toFixed(1).replace('.', ','),
  };
}

export default function HistoricoPage() {
  const [sessoes, setSessoes] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [offset, setOffset] = useState(0);
  const [temMais, setTemMais] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erroMais, setErroMais] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    setOffset(0);
    setTemMais(false);
    try {
      const dados = await listarSessoes({ limite: LIMITE, offset: 0 });
      setSessoes(dados);
      setTemMais(dados.length === LIMITE);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function carregarMais() {
    const novoOffset = offset + LIMITE;
    setCarregandoMais(true);
    setErroMais(null);
    try {
      const dados = await listarSessoes({ limite: LIMITE, offset: novoOffset });
      setSessoes((prev) => [...(prev ?? []), ...dados]);
      setOffset(novoOffset);
      setTemMais(dados.length === LIMITE);
    } catch (err) {
      setErroMais(err.message);
    } finally {
      setCarregandoMais(false);
    }
  }

  const painel = useMemo(() => resumo(sessoes), [sessoes]);

  return (
    <div>
      <header className="mb-8 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-surface via-surface to-ink p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand">Sobrecarga progressiva</p>
            <h1 className="title-display mt-1 text-4xl font-semibold sm:text-5xl">
              Seu <span className="text-brand">progresso</span>
            </h1>
          </div>
          <Link
            to="/sessoes/nova"
            className="glow-brand rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
          >
            + Nova sessão
          </Link>
        </div>

        {painel && (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile rotulo="Último treino" valor={painel.ultimo} />
              <StatTile rotulo="Esta semana" valor={painel.estaSemana} sufixo="treinos" />
              <StatTile
                rotulo="Sequência"
                valor={painel.sequencia}
                sufixo="sem."
                destaque={painel.sequencia > 1}
              />
              <StatTile rotulo="Média semanal" valor={painel.media} />
            </div>
            <div className="mt-6">
              <p className="mb-2 text-[11px] uppercase tracking-widest text-zinc-500">
                Consistência
              </p>
              <Heatmap datas={sessoes.map((s) => s.data)} />
            </div>
          </>
        )}
      </header>

      <h2 className="title-display mb-4 text-xl text-zinc-300">Histórico</h2>

      {carregando && <p className="text-zinc-400">Carregando...</p>}

      {erro && (
        <div role="alert" className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="mb-2 text-red-300">{erro}</p>
          <button type="button" onClick={carregar} className="text-sm text-red-200 underline">
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && !erro && sessoes !== null && <SessaoList sessoes={sessoes} />}

      {!carregando && !erro && temMais && (
        <div className="mt-6 text-center">
          {erroMais && <p className="mb-2 text-sm text-red-400">{erroMais}</p>}
          <button
            type="button"
            onClick={carregarMais}
            disabled={carregandoMais}
            className="rounded-xl border border-line px-5 py-2.5 text-sm text-zinc-300 transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-50"
          >
            {carregandoMais ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  );
}
