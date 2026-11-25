import { dataCurta, kg } from '../lib/formatters.js';

const W = 640;
const MARGEM = { esq: 8, dir: 8, topo: 18, base: 26 };

export default function LineChart({ pontos, altura = 190, cor = 'var(--color-brand)' }) {
  if (!pontos || pontos.length === 0) return null;

  const valores = pontos.map((p) => Number.parseFloat(p.carga_maxima_kg));
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const amplitude = max - min || 1;
  const util = {
    largura: W - MARGEM.esq - MARGEM.dir,
    altura: altura - MARGEM.topo - MARGEM.base,
  };

  const x = (i) => MARGEM.esq + (i * util.largura) / Math.max(pontos.length - 1, 1);
  const y = (v) => MARGEM.topo + (1 - (v - min) / amplitude) * util.altura;

  const linha = valores.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  const area = `${linha} L${x(valores.length - 1)},${altura - MARGEM.base} L${x(0)},${altura - MARGEM.base} Z`;
  const ultimo = valores.length - 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${altura}`}
      className="w-full"
      role="img"
      aria-label={`Evolução da carga: de ${kg(valores[0])} kg a ${kg(valores[ultimo])} kg`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="area-evolucao" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity="0.26" />
          <stop offset="100%" stopColor={cor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={area} fill="url(#area-evolucao)" />
      <path d={linha} fill="none" stroke={cor} strokeWidth="2.5" strokeLinejoin="round" />

      {valores.map((v, i) => (
        <circle
          key={pontos[i].data}
          cx={x(i)}
          cy={y(v)}
          r={i === ultimo ? 5 : 3}
          fill={i === ultimo ? cor : 'var(--color-ink)'}
          stroke={cor}
          strokeWidth="2"
        />
      ))}

      <text x={MARGEM.esq} y={altura - 8} fontSize="11" fill="#71717a">
        {dataCurta(pontos[0].data)}
      </text>
      <text x={W - MARGEM.dir} y={altura - 8} fontSize="11" fill="#71717a" textAnchor="end">
        {dataCurta(pontos[ultimo].data)}
      </text>
    </svg>
  );
}
