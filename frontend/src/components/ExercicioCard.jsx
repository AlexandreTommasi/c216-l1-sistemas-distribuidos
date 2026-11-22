import DeltaBadge from './DeltaBadge.jsx';

export default function ExercicioCard({ series, progresso, onRemoverSerie }) {
  const nome = progresso?.nome ?? `Exercício #${series[0]?.exercicio_id}`;

  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-zinc-100">{nome}</h3>
        <DeltaBadge status={progresso?.status} delta={progresso?.delta} />
      </div>

      {progresso?.eh_recorde && (
        <p className="text-xs text-amber-400 font-medium mb-2">★ Recorde pessoal</p>
      )}

      <ul className="space-y-1">
        {series.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-sm">
            <span className="text-2xl font-bold text-zinc-100 w-14 text-right tabular-nums">
              {Number.parseFloat(s.carga_kg)}
            </span>
            <span className="text-zinc-500 text-xs">kg</span>
            <span className="text-zinc-500 text-sm">×</span>
            <span className="text-2xl font-bold text-zinc-100 tabular-nums">{s.repeticoes}</span>
            <span className="text-zinc-500 text-xs flex-1">
              {s.tipo !== 'valida' ? s.tipo : ''}
            </span>
            <button
              type="button"
              onClick={() => onRemoverSerie(s.id)}
              className="text-zinc-600 hover:text-red-400 transition-colors min-h-[44px] px-3"
              aria-label={`Remover série ${s.ordem}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {progresso?.sessao_anterior && (
        <div className="mt-3 pt-3 border-t border-zinc-700 text-xs text-zinc-500">
          <span>Última vez ({progresso.sessao_anterior.data}): </span>
          <span className="text-zinc-400">
            {Number.parseFloat(progresso.sessao_anterior.carga_maxima_kg)} kg máx ·{' '}
            {progresso.sessao_anterior.repeticoes_totais} reps
          </span>
        </div>
      )}
    </div>
  );
}
