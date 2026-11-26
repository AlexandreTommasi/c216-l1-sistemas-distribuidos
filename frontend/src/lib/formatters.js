const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// A API devolve a data como "YYYY-MM-DD". Montar com new Date(str) usaria UTC e
// deslocaria o dia no fuso do Brasil, entao a data e construida por partes.
export function paraData(iso) {
  const [ano, mes, dia] = String(iso).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function diasAtras(iso, hoje = new Date()) {
  const d = paraData(iso);
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((base - d) / 86400000);
}

export function dataCurta(iso) {
  const d = paraData(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

export function dataLonga(iso) {
  const d = paraData(iso);
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

export function dataRelativa(iso, hoje = new Date()) {
  const dias = diasAtras(iso, hoje);
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  if (dias < 14) return 'há 1 semana';
  if (dias < 60) return `há ${Math.floor(dias / 7)} semanas`;
  return dataCurta(iso);
}

export function kg(valor) {
  const n = Number.parseFloat(valor);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

export function kgComSinal(valor) {
  const n = Number.parseFloat(valor);
  if (Number.isNaN(n)) return '—';
  return `${n > 0 ? '+' : ''}${kg(n)}`;
}

// So a primeira letra: e o padrao em portugues ("Leg press") e preserva o que
// o usuario digitou no resto do nome.
export function titulo(texto) {
  const s = String(texto ?? '');
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// Data local em "YYYY-MM-DD". toISOString() usaria UTC: depois das 21h no
// Brasil devolveria o dia seguinte, que a validacao recusa como data futura.
export function isoLocal(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
