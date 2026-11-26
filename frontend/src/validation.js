export function dataValida(dataStr) {
  if (!dataStr) return false;
  const data = new Date(dataStr);
  return !Number.isNaN(data.getTime());
}

export function dataNaoFutura(dataStr) {
  if (!dataValida(dataStr)) return false;
  return new Date(dataStr) <= new Date();
}

export function cargaPositiva(carga) {
  return typeof carga === 'number' && carga > 0;
}
