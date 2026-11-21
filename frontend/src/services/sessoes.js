import { del, get, patch, post } from './client.js';

export const listarSessoes = () => get('/sessoes');
export const buscarSessao = (id) => get(`/sessoes/${id}`);
export const criarSessao = (dados) => post('/sessoes', dados);
export const atualizarSessao = (id, dados) => patch(`/sessoes/${id}`, dados);
export const removerSessao = (id) => del(`/sessoes/${id}`);
export const compararSessao = (id) => get(`/sessoes/${id}/comparacao`);
