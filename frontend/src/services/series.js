import { del, patch, post } from './client.js';

export const criarSerie = (sessaoId, dados) => post(`/sessoes/${sessaoId}/series`, dados);
export const atualizarSerie = (id, dados) => patch(`/series/${id}`, dados);
export const removerSerie = (id) => del(`/series/${id}`);
