import { Link } from 'react-router-dom';

export default function SessaoList({ sessoes }) {
  if (sessoes.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-400">
        <p className="text-lg mb-2">Nenhuma sessão registrada ainda.</p>
        <p className="text-sm">Use "+ Nova sessão" para começar.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {sessoes.map((s) => {
        const volume = Number.parseFloat(s.volume_total_kg ?? 0);
        const volumeLabel =
          volume === 0
            ? 'sem séries registradas'
            : `${volume.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} kg`;
        return (
          <li key={s.id}>
            <Link
              to={`/sessoes/${s.id}`}
              className="block bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-xl p-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-zinc-100">{s.treino_nome}</p>
                  <p className="text-sm text-zinc-400 mt-0.5">{s.data}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-100">{volumeLabel}</p>
                  <span className="text-zinc-500 text-xs">volume</span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
