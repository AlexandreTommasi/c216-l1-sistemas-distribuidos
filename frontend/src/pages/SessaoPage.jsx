import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ExercicioCard from '../components/ExercicioCard.jsx';
import SerieForm from '../components/SerieForm.jsx';
import { listarExercicios } from '../services/exercicios.js';
import { criarSerie, removerSerie } from '../services/series.js';
import { buscarSessao, compararSessao } from '../services/sessoes.js';

export default function SessaoPage() {
  const { id } = useParams();
  const [sessao, setSessao] = useState(null);
  const [progresso, setProgresso] = useState(null);
  const [exercicios, setExercicios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [erroRemover, setErroRemover] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [s, p, ex] = await Promise.all([
        buscarSessao(id),
        compararSessao(id),
        listarExercicios(),
      ]);
      setSessao(s);
      setProgresso(p);
      setExercicios(ex);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleNovaSerie(dados) {
    await criarSerie(Number(id), dados);
    await carregar();
  }

  async function handleRemoverSerie(serieId) {
    setErroRemover(null);
    try {
      await removerSerie(serieId);
      await carregar();
    } catch (err) {
      setErroRemover(err.message);
    }
  }

  if (carregando) {
    return <p className="text-zinc-400 py-8">Carregando...</p>;
  }

  if (erro) {
    return (
      <div role="alert" className="bg-red-900/40 border border-red-700 rounded-lg p-4">
        <p className="text-red-300 mb-2">{erro}</p>
        <button type="button" onClick={carregar} className="text-sm text-red-300 underline">
          Tentar de novo
        </button>
      </div>
    );
  }

  const progPorEx = Object.fromEntries(
    (progresso?.exercicios ?? []).map((ep) => [ep.exercicio_id, ep]),
  );

  const seriesPorEx = (sessao?.series ?? []).reduce((acc, s) => {
    if (!acc[s.exercicio_id]) acc[s.exercicio_id] = [];
    acc[s.exercicio_id].push(s);
    return acc;
  }, {});

  const exercicioIds = [...new Set((sessao?.series ?? []).map((s) => s.exercicio_id))];

  const seriesValidas = (sessao?.series ?? []).filter((s) => s.tipo === 'valida');
  const numExercicios = new Set(seriesValidas.map((s) => s.exercicio_id)).size;
  const numSeries = seriesValidas.length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">{sessao?.treino_nome}</h1>
        <p className="text-zinc-400 text-sm">{sessao?.data}</p>
        <p className="text-zinc-400 text-sm mt-1">
          {numExercicios} {numExercicios === 1 ? 'exercício' : 'exercícios'} ·{' '}
          {numSeries} {numSeries === 1 ? 'série' : 'séries'}
        </p>
      </div>

      {exercicioIds.length === 0 && (
        <p className="text-zinc-500 text-sm mb-6">
          Nenhuma série ainda. Use o formulário abaixo para registrar.
        </p>
      )}

      {erroRemover && (
        <div role="alert" className="bg-red-900/40 border border-red-700 rounded-lg p-3 mb-4">
          <p className="text-red-300 text-sm">{erroRemover}</p>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {exercicioIds.map((exId) => (
          <ExercicioCard
            key={exId}
            series={seriesPorEx[exId]}
            progresso={progPorEx[exId]}
            onRemoverSerie={handleRemoverSerie}
          />
        ))}
      </div>

      <SerieForm exercicios={exercicios} onSalvar={handleNovaSerie} />
    </div>
  );
}
