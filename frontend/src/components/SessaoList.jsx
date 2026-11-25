import { Link } from 'react-router-dom';
import { dataLonga, dataRelativa } from '../lib/formatters.js';

export default function SessaoList({ sessoes }) {
  if (sessoes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line py-16 text-center">
        <p className="mb-2 text-lg text-zinc-300">Nenhuma sessão registrada ainda.</p>
        <p className="text-sm text-zinc-500">Use "+ Nova sessão" para começar.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {sessoes.map((s) => (
        <li key={s.id} className="enter-up">
          <Link
            to={`/sessoes/${s.id}`}
            className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand/40 hover:bg-surface-2"
          >
            <span className="h-11 w-1 shrink-0 rounded-full bg-brand/70 transition-all group-hover:h-14" />
            <div className="min-w-0 flex-1">
              <p className="title-display text-lg text-zinc-100">{s.treino_nome}</p>
              <p className="mt-0.5 truncate text-sm text-zinc-500">{dataLonga(s.data)}</p>
              {s.observacao && (
                <p className="mt-1 truncate text-xs text-zinc-600 italic">{s.observacao}</p>
              )}
            </div>
            <span className="shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] text-zinc-400">
              {dataRelativa(s.data)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
