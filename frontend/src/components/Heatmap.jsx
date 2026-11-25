import { paraData } from '../lib/formatters.js';

const DIAS_SEMANA = [
  { chave: 'dom', letra: 'D' },
  { chave: 'seg', letra: 'S' },
  { chave: 'ter', letra: 'T' },
  { chave: 'qua', letra: 'Q' },
  { chave: 'qui', letra: 'Q' },
  { chave: 'sex', letra: 'S' },
  { chave: 'sab', letra: 'S' },
];

export default function Heatmap({ datas, semanas = 11, hoje = new Date() }) {
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const inicio = new Date(base);
  inicio.setDate(base.getDate() - base.getDay() - (semanas - 1) * 7);

  const treinados = new Set((datas ?? []).map((d) => paraData(d).toDateString()));

  const colunas = [];
  for (let s = 0; s < semanas; s += 1) {
    const dias = [];
    for (let d = 0; d < 7; d += 1) {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + s * 7 + d);
      dias.push({
        chave: dia.toDateString(),
        treinou: treinados.has(dia.toDateString()),
        futuro: dia > base,
      });
    }
    colunas.push(dias);
  }

  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-between py-[1px] text-[9px] text-zinc-600">
        {DIAS_SEMANA.map(({ chave, letra }) => (
          <span key={chave} className="h-3 leading-none">
            {letra}
          </span>
        ))}
      </div>
      <div className="grid grid-flow-col gap-[3px]" style={{ gridTemplateRows: 'repeat(7, 12px)' }}>
        {colunas.flatMap((dias) =>
          dias.map(({ chave, treinou, futuro }) => (
            <span
              key={chave}
              title={chave}
              className={`h-3 w-3 rounded-[3px] ${
                futuro ? 'bg-transparent' : treinou ? 'bg-brand' : 'bg-surface-2 border border-line'
              }`}
            />
          )),
        )}
      </div>
    </div>
  );
}
