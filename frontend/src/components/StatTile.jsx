export default function StatTile({ rotulo, valor, sufixo, destaque = false }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className="text-[11px] uppercase tracking-widest text-zinc-500">{rotulo}</p>
      <p className={`title-display mt-1 text-3xl ${destaque ? 'text-brand' : 'text-zinc-100'}`}>
        {valor}
        {sufixo && <span className="ml-1 text-base text-zinc-500">{sufixo}</span>}
      </p>
    </div>
  );
}
