import { del, get, patch, post } from './client.js';

export const listarTreinos = () => get('/treinos');
export const buscarTreino = (id) => get(`/treinos/${id}`);
export const criarTreino = (dados) => post('/treinos', dados);
export const atualizarTreino = (id, dados) => patch(`/treinos/${id}`, dados);
export const removerTreino = (id) => del(`/treinos/${id}`);
export const buscarSugestao = (id) => get(`/treinos/${id}/sugestao`);
