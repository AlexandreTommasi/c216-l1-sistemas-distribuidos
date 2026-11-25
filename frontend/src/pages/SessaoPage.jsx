import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import ExercicioCard from '../components/ExercicioCard.jsx';
import { dataLonga, dataRelativa, titulo } from '../lib/formatters.js';
import { grupo } from '../lib/grupos.js';
import { criarExercicio, listarExercicios } from '../services/exercicios.js';
import { criarSerie, removerSerie } from '../services/series.js';
import { buscarSessao, compararSessao } from '../services/sessoes.js';
import { buscarSugestao } from '../services/treinos.js';
import { cargaPositiva } from '../validation.js';

const GRUPOS = [
  'peito',
  'costas',
  'pernas',
  'ombros',
  'biceps',
  'triceps',
  'abdomen',
  'panturrilha',
];
const TIPOS = ['valida', 'aquecimento', 'preparatoria'];

export default function SessaoPage() {
  const { id } = useParams();

  const [sessao, setSessao] = useState(null);
  const [progresso, setProgresso] = useState(null);
  const [exercicios, setExercicios] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [erroRemover, setErroRemover] = useState(null);

  // Seletor de exercício
  const [filtro, setFiltro] = useState('');
  const [exercicioAtualId, setExercicioAtualId] = useState(null);

  // Formulário de série
  const [cargaKg, setCargaKg] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [tipo, setTipo] = useState('valida');
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(null);

  // Criação de exercício inline
  const [criarAberto, setCriarAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoGrupo, setNovoGrupo] = useState('peito');
  const [salvandoEx, setSalvandoEx] = useState(false);
  const [erroEx, setErroEx] = useState(null);

  const formRef = useRef(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    setExercicioAtualId(null);
    setCargaKg('');
    setRepeticoes('');
    setTipo('valida');
    setErroSalvar(null);
    setFiltro('');
    setCriarAberto(false);
    try {
      const [s, p, ex] = await Promise.all([
        buscarSessao(id),
        compararSessao(id),
        listarExercicios(),
      ]);
      setSessao(s);
      setProgresso(p);
      setExercicios(ex);
      if (s.series.length === 0) {
        try {
          const sug = await buscarSugestao(s.treino_id);
          setSugestoes(sug);
        } catch {
          setSugestoes([]);
        }
      } else {
        setSugestoes([]);
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function handleSelecionarExercicio(exId) {
    setExercicioAtualId(exId);
    setFiltro('');
    setCriarAberto(false);
    setErroSalvar(null);
    const sug = sugestoes.find((s) => s.exercicio_id === exId);
    if (sug) {
      setCargaKg(String(Number.parseFloat(sug.carga_kg)));
      setRepeticoes(String(sug.repeticoes));
    } else {
      setCargaKg('');
      setRepeticoes('');
    }
    setTipo('valida');
  }

  function handleAdicionarSerie(exId) {
    handleSelecionarExercicio(exId);
    const doExercicio = (sessao?.series ?? []).filter((s) => s.exercicio_id === exId);
    const validas = doExercicio.filter((s) => s.tipo === 'valida');
    const ultima = validas.at(-1) ?? doExercicio.at(-1);
    if (ultima) {
      setCargaKg(String(Number.parseFloat(ultima.carga_kg)));
      setRepeticoes(String(ultima.repeticoes));
    }
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' }),
    );
  }

  async function handleSalvarSerie(e) {
    e.preventDefault();
    const carga = Number.parseFloat(cargaKg);
    if (!cargaPositiva(carga)) {
      setErroSalvar('A carga deve ser maior que zero.');
      return;
    }
    setSalvando(true);
    setErroSalvar(null);
    try {
      await criarSerie(Number(id), {
        exercicio_id: exercicioAtualId,
        carga_kg: carga,
        repeticoes: Number(repeticoes),
        tipo,
      });
      const [s, p, ex] = await Promise.all([
        buscarSessao(id),
        compararSessao(id),
        listarExercicios(),
      ]);
      setSessao(s);
      setProgresso(p);
      setExercicios(ex);
    } catch (err) {
      setErroSalvar(err.message);
    } finally {
      setSalvando(false);
    }
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

  async function handleCriarExercicio(e) {
    e.preventDefault();
    if (!novoNome.trim()) return;
    setSalvandoEx(true);
    setErroEx(null);
    try {
      const ex = await criarExercicio({ nome: novoNome.trim(), grupo_muscular: novoGrupo });
      const exs = await listarExercicios();
      setExercicios(exs);
      setNovoNome('');
      setCriarAberto(false);
      handleSelecionarExercicio(ex.id);
    } catch (err) {
      setErroEx(err.message);
    } finally {
      setSalvandoEx(false);
    }
  }

  if (carregando) {
    return <p className="text-zinc-400 py-8">Carregando...</p>;
  }

  if (erro) {
    return (
      <div role="alert" className="border border-red-500/30 bg-red-500/10 rounded-xl p-4">
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

  const exerciciosFiltrados = filtro.trim()
    ? exercicios.filter((e) => e.nome.toLowerCase().includes(filtro.trim().toLowerCase()))
    : [];

  const ultimaVez = exercicioAtualId
    ? (sugestoes.find((s) => s.exercicio_id === exercicioAtualId) ?? null)
    : null;

  const nomeAtual = exercicioAtualId
    ? titulo(
        exercicios.find((e) => e.id === exercicioAtualId)?.nome ?? `Exercício #${exercicioAtualId}`,
      )
    : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="title-display text-3xl">{sessao?.treino_nome}</h1>
        <p className="text-zinc-400 text-sm">
          {sessao?.data && dataLonga(sessao.data)}
          <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[11px] text-zinc-500">
            {sessao?.data && dataRelativa(sessao.data)}
          </span>
        </p>
        <p className="text-zinc-400 text-sm mt-1">
          {numExercicios} {numExercicios === 1 ? 'exercício' : 'exercícios'} · {numSeries}{' '}
          {numSeries === 1 ? 'série' : 'séries'}
        </p>
      </div>

      {erroRemover && (
        <div role="alert" className="border border-red-500/30 bg-red-500/10 rounded-xl p-3 mb-4">
          <p className="text-red-300 text-sm">{erroRemover}</p>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {exercicioIds.map((exId) => (
          <ExercicioCard
            key={exId}
            series={seriesPorEx[exId]}
            progresso={progPorEx[exId]}
            grupoMuscular={exercicios.find((e) => e.id === exId)?.grupo_muscular}
            onRemoverSerie={handleRemoverSerie}
            onAdicionarSerie={() => handleAdicionarSerie(exId)}
          />
        ))}
      </div>

      {exercicioIds.length === 0 && sugestoes.length > 0 && !exercicioAtualId && (
        <div className="mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
            Sugestão — última sessão
          </p>
          <div className="space-y-2">
            {sugestoes.map((sug) => (
              <button
                key={sug.exercicio_id}
                type="button"
                onClick={() => handleSelecionarExercicio(sug.exercicio_id)}
                className="w-full text-left bg-surface/60 border border-line rounded-2xl p-3 hover:border-brand/50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-100">{titulo(sug.nome)}</span>
                  <span className="text-sm text-zinc-400">
                    {Number.parseFloat(sug.carga_kg)} kg × {sug.repeticoes} · {sug.series_validas}{' '}
                    {sug.series_validas === 1 ? 'série' : 'séries'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={formRef}
        className={`rounded-2xl border bg-surface p-4 transition-colors ${
          exercicioAtualId ? 'border-brand/40' : 'border-line'
        }`}
      >
        <h3 className="title-display mb-4 text-xl text-zinc-100">
          {nomeAtual ?? 'Adicionar exercício'}
        </h3>

        {!exercicioAtualId ? (
          <>
            <div className="mb-3">
              <label className="block text-xs text-zinc-400 mb-1" htmlFor="add-exercicio">
                Exercício
              </label>
              <input
                id="add-exercicio"
                type="text"
                value={filtro}
                onChange={(e) => {
                  setFiltro(e.target.value);
                  setCriarAberto(false);
                }}
                placeholder="Buscar exercício..."
                className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-brand"
              />
            </div>

            {filtro.trim().length > 0 && (
              <ul className="mb-3 bg-surface-2 rounded-xl overflow-hidden border border-line">
                {exerciciosFiltrados.map((ex) => (
                  <li key={ex.id}>
                    <button
                      type="button"
                      onClick={() => handleSelecionarExercicio(ex.id)}
                      className="w-full text-left px-3 py-2.5 text-sm text-zinc-100 hover:bg-surface-2 transition-colors"
                    >
                      {titulo(ex.nome)}
                    </button>
                  </li>
                ))}
                {exerciciosFiltrados.length === 0 && (
                  <li className="px-3 py-2.5 text-sm text-zinc-400">
                    Nenhum resultado.{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setNovoNome(filtro.trim());
                        setFiltro('');
                        setCriarAberto(true);
                      }}
                      className="text-brand underline"
                    >
                      {`Criar "${filtro.trim()}"`}
                    </button>
                  </li>
                )}
              </ul>
            )}

            {criarAberto && (
              <form onSubmit={handleCriarExercicio} className="space-y-3 mt-2">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1" htmlFor="novo-ex-nome">
                    Nome do exercício
                  </label>
                  <input
                    id="novo-ex-nome"
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    required
                    className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1" htmlFor="novo-ex-grupo">
                    Grupo muscular
                  </label>
                  <select
                    id="novo-ex-grupo"
                    value={novoGrupo}
                    onChange={(e) => setNovoGrupo(e.target.value)}
                    className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-brand"
                  >
                    {GRUPOS.map((g) => (
                      <option key={g} value={g}>
                        {grupo(g).rotulo}
                      </option>
                    ))}
                  </select>
                </div>

                {erroEx && (
                  <div
                    role="alert"
                    className="border border-red-500/30 bg-red-500/10 rounded-xl p-2"
                  >
                    <p className="text-red-300 text-xs">{erroEx}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={salvandoEx}
                  className="w-full bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed text-ink font-semibold py-3 rounded-xl text-sm"
                >
                  {salvandoEx ? 'Salvando...' : 'Criar exercício'}
                </button>
              </form>
            )}

            {exercicios.length === 0 && !criarAberto && (
              <p className="text-zinc-500 text-sm">
                Nenhum exercício cadastrado. Busque acima para criar o primeiro.
              </p>
            )}
          </>
        ) : (
          <form onSubmit={handleSalvarSerie} className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-zinc-400">{nomeAtual}</span>
              <button
                type="button"
                onClick={() => {
                  setExercicioAtualId(null);
                  setCargaKg('');
                  setRepeticoes('');
                  setErroSalvar(null);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline"
              >
                Trocar exercício
              </button>
            </div>

            {ultimaVez && (
              <p className="text-xs text-zinc-500">
                última vez: {Number.parseFloat(ultimaVez.carga_kg)} kg × {ultimaVez.repeticoes}
              </p>
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-zinc-400 mb-1" htmlFor="add-carga">
                  Carga (kg)
                </label>
                <input
                  id="add-carga"
                  type="number"
                  min="0.25"
                  step="any"
                  value={cargaKg}
                  onChange={(e) => setCargaKg(e.target.value)}
                  required
                  placeholder="80"
                  className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-brand"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-zinc-400 mb-1" htmlFor="add-reps">
                  Repetições
                </label>
                <input
                  id="add-reps"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={repeticoes}
                  onChange={(e) => setRepeticoes(e.target.value)}
                  required
                  placeholder="10"
                  className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1" htmlFor="add-tipo">
                Tipo
              </label>
              <select
                id="add-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-surface-2 border border-line rounded-xl px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-brand"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {erroSalvar && (
              <div role="alert" className="border border-red-500/30 bg-red-500/10 rounded-xl p-2">
                <p className="text-red-300 text-xs">{erroSalvar}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed text-ink font-semibold py-3 rounded-xl text-sm"
            >
              {salvando ? 'Salvando...' : 'Registrar série'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
