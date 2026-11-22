export default function DeltaBadge({ status, delta }) {
  if (status === 'primeira_vez') {
    return (
      <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">
        Primeira vez
      </span>
    );
  }
  if (!delta) return null;

  const kg = Number.parseFloat(delta.carga_kg);
  const sign = kg > 0 ? '+' : '';

  if (status === 'evoluiu') {
    return (
      <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full">
        ▲ {sign}
        {kg} kg
      </span>
    );
  }
  if (status === 'regrediu') {
    return (
      <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">
        ▼ {sign}
        {kg} kg
      </span>
    );
  }
  return (
    <span className="text-xs bg-zinc-700/50 text-zinc-400 px-2 py-0.5 rounded-full">= igual</span>
  );
}
