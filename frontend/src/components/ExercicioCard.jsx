import { dataCurta, kg, titulo } from '../lib/formatters.js';
import { grupo } from '../lib/grupos.js';
import DeltaBadge from './DeltaBadge.jsx';
import MuscleIcon from './MuscleIcon.jsx';

const ROTULO_TIPO = { aquecimento: 'aquecimento', preparatoria: 'preparatória' };

export default function ExercicioCard({
  series,
  progresso,
  grupoMuscular,
  onRemoverSerie,
  onAdicionarSerie,
}) {
  const nome = progresso?.nome ?? `Exercício #${series[0]?.exercicio_id}`;
  const g = grupo(grupoMuscular);

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface">
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ color: g.cor, backgroundColor: `${g.cor}1a` }}
          >
            <MuscleIcon chave={grupoMuscular} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-zinc-100">{titulo(nome)}</h3>
            {progresso?.eh_recorde && (
              <span className="text-xs font-medium text-brand">★ Novo recorde</span>
            )}
          </div>
        </div>
        <DeltaBadge status={progresso?.status} delta={progresso?.delta} />
      </header>

      <ul className="divide-y divide-line/60">
        {series.map((s) => (
          <li key={s.id} className="flex items-center gap-2 px-4 py-2 text-sm">
            <span className="title-display w-16 text-right text-2xl tabular-nums text-zinc-100">
              {Number.parseFloat(s.carga_kg)}
            </span>
            <span className="text-xs text-zinc-500">kg</span>
            <span className="text-sm text-zinc-600">×</span>
            <span className="title-display text-2xl tabular-nums text-zinc-100">
              {s.repeticoes}
            </span>
            <span className="flex-1 text-xs text-zinc-600">{ROTULO_TIPO[s.tipo] ?? ''}</span>
            <button
              type="button"
              onClick={() => onRemoverSerie(s.id)}
              className="min-h-[44px] rounded-lg px-3 text-zinc-700 transition-colors hover:bg-red-500/10 hover:text-red-400"
              aria-label={`Remover série ${s.ordem}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-2">
        <span className="text-xs text-zinc-500">
          {progresso?.sessao_anterior && (
            <>
              Última vez em {dataCurta(progresso.sessao_anterior.data)}:{' '}
              <span className="text-zinc-300">
                {kg(progresso.sessao_anterior.carga_maxima_kg)} kg
              </span>
            </>
          )}
        </span>
        {onAdicionarSerie && (
          <button
            type="button"
            onClick={onAdicionarSerie}
            aria-label={`Adicionar série em ${titulo(nome)}`}
            className="min-h-[40px] shrink-0 rounded-xl border border-brand/40 bg-brand/10 px-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/20"
          >
            + Série
          </button>
        )}
      </footer>
    </article>
  );
}
