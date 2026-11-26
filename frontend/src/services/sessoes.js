import { del, get, patch, post } from './client.js';

export const listarSessoes = ({ limite = 20, offset = 0 } = {}) =>
  get(`/sessoes?limite=${limite}&offset=${offset}`);
export const buscarSessao = (id) => get(`/sessoes/${id}`);
export const criarSessao = (dados) => post('/sessoes', dados);
export const atualizarSessao = (id, dados) => patch(`/sessoes/${id}`, dados);
export const removerSessao = (id) => del(`/sessoes/${id}`);
export const compararSessao = (id) => get(`/sessoes/${id}/comparacao`);
