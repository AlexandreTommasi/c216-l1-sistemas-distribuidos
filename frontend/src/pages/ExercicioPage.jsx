import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LineChart from '../components/LineChart.jsx';
import MuscleIcon from '../components/MuscleIcon.jsx';
import StatTile from '../components/StatTile.jsx';
import { dataLonga, kg, kgComSinal, titulo } from '../lib/formatters.js';
import { grupo } from '../lib/grupos.js';
import { buscarExercicio, historicoExercicio } from '../services/exercicios.js';

export default function ExercicioPage() {
  const { id } = useParams();
  const [exercicio, setExercicio] = useState(null);
  const [pontos, setPontos] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [ex, historico] = await Promise.all([buscarExercicio(id), historicoExercicio(id)]);
      setExercicio(ex);
      setPontos(historico);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) return <p className="text-zinc-400">Carregando...</p>;

  if (erro) {
    return (
      <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="mb-2 text-red-300">{erro}</p>
        <button type="button" onClick={carregar} className="text-sm text-red-200 underline">
          Tentar de novo
        </button>
      </div>
    );
  }

  const g = grupo(exercicio?.grupo_muscular);
  const cargas = (pontos ?? []).map((p) => Number.parseFloat(p.carga_maxima_kg));
  const recorde = cargas.length ? Math.max(...cargas) : null;
  const ganho = cargas.length > 1 ? cargas[cargas.length - 1] - cargas[0] : null;

  return (
    <div>
      <Link to="/exercicios" className="text-sm text-zinc-500 hover:text-brand">
        ← Exercícios
      </Link>

      <header className="mt-3 flex items-center gap-4">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line"
          style={{ color: g.cor, backgroundColor: `${g.cor}1a` }}
        >
          <MuscleIcon chave={exercicio?.grupo_muscular} className="h-6 w-6" />
        </span>
        <div>
          <h1 className="title-display text-3xl">{titulo(exercicio?.nome)}</h1>
          <p className="text-sm" style={{ color: g.cor }}>
            {g.rotulo}
          </p>
        </div>
      </header>

      {cargas.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-line py-14 text-center text-zinc-400">
          Nenhuma série registrada ainda. Registre uma sessão para ver a evolução aqui.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatTile rotulo="Recorde" valor={kg(recorde)} sufixo="kg" destaque />
            <StatTile rotulo="Sessões" valor={pontos.length} />
            <StatTile
              rotulo="Ganho"
              valor={ganho === null ? '—' : kgComSinal(ganho)}
              sufixo={ganho === null ? undefined : 'kg'}
            />
          </div>

          <section className="mt-6 rounded-3xl border border-line bg-surface p-5">
            <p className="mb-3 text-[11px] uppercase tracking-widest text-zinc-500">
              Carga máxima por sessão
            </p>
            <LineChart pontos={pontos} cor={g.cor} />
          </section>

          <section className="mt-6">
            <p className="mb-3 text-[11px] uppercase tracking-widest text-zinc-500">
              Sessão a sessão
            </p>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {[...pontos].reverse().map((p) => (
                <li key={p.data} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-zinc-400">{dataLonga(p.data)}</span>
                  <span className="text-sm">
                    <span className="title-display text-xl text-zinc-100">
                      {kg(p.carga_maxima_kg)}
                    </span>
                    <span className="ml-1 text-zinc-500">kg</span>
                    <span className="ml-3 text-zinc-600">{p.repeticoes_totais} reps</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
