import { kgComSinal } from '../lib/formatters.js';

const BASE = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold';

export default function DeltaBadge({ status, delta }) {
  if (status === 'primeira_vez') {
    return (
      <span className={`${BASE} bg-surface-2 text-zinc-400 border border-line`}>Primeira vez</span>
    );
  }
  if (!delta) return null;

  if (status === 'evoluiu') {
    return (
      <span className={`${BASE} bg-brand/15 text-brand border border-brand/30`}>
        <span aria-hidden="true">▲</span> {kgComSinal(delta.carga_kg)} kg
      </span>
    );
  }
  if (status === 'regrediu') {
    return (
      <span className={`${BASE} bg-red-500/10 text-red-300 border border-red-500/25`}>
        <span aria-hidden="true">▼</span> {kgComSinal(delta.carga_kg)} kg
      </span>
    );
  }
  return <span className={`${BASE} bg-surface-2 text-zinc-400 border border-line`}>= igual</span>;
}
