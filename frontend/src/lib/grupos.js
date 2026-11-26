// Identidade por grupo muscular. O verde-limao fica reservado para acao e
// progresso; os grupos usam tons dessaturados para nao competir com ele.
export const GRUPOS = {
  peito: { rotulo: 'Peito', cor: '#E8A06A' },
  costas: { rotulo: 'Costas', cor: '#6FB7D8' },
  pernas: { rotulo: 'Pernas', cor: '#A8D06A' },
  ombros: { rotulo: 'Ombros', cor: '#A08FD0' },
  biceps: { rotulo: 'Bíceps', cor: '#D87F90' },
  triceps: { rotulo: 'Tríceps', cor: '#6FC9A8' },
  abdomen: { rotulo: 'Abdômen', cor: '#D8BE6A' },
  panturrilha: { rotulo: 'Panturrilha', cor: '#9AA0A6' },
};

export const ORDEM_GRUPOS = Object.keys(GRUPOS);

export function grupo(chave) {
  return GRUPOS[chave] ?? { rotulo: chave ?? 'Outro', cor: '#9AA0A6' };
}
