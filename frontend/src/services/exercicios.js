import { del, get, patch, post } from './client.js';

export const listarExercicios = (grupo = null) =>
  get(grupo ? `/exercicios?grupo=${encodeURIComponent(grupo)}` : '/exercicios');
export const buscarExercicio = (id) => get(`/exercicios/${id}`);
export const criarExercicio = (dados) => post('/exercicios', dados);
export const atualizarExercicio = (id, dados) => patch(`/exercicios/${id}`, dados);
export const removerExercicio = (id) => del(`/exercicios/${id}`);
export const historicoExercicio = (id) => get(`/exercicios/${id}/historico`);
