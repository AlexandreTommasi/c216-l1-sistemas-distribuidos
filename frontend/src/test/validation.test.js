import { describe, expect, it } from 'vitest';
import { cargaPositiva, dataNaoFutura, dataValida } from '../validation.js';

describe('dataValida', () => {
  it('retorna true para data válida', () => {
    expect(dataValida('2024-01-15')).toBe(true);
  });

  it('retorna false para string vazia', () => {
    expect(dataValida('')).toBe(false);
  });

  it('retorna false para string inválida', () => {
    expect(dataValida('nao-e-uma-data')).toBe(false);
  });
});

describe('dataNaoFutura', () => {
  it('retorna true para data no passado', () => {
    expect(dataNaoFutura('2024-01-15')).toBe(true);
  });

  it('retorna false para data futura calculada a partir de hoje', () => {
    const amanha = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    expect(dataNaoFutura(amanha)).toBe(false);
  });

  it('retorna false para string inválida', () => {
    expect(dataNaoFutura('nao-e-uma-data')).toBe(false);
  });
});

describe('cargaPositiva', () => {
  it('retorna true para número positivo', () => {
    expect(cargaPositiva(80)).toBe(true);
  });

  it('retorna false para zero', () => {
    expect(cargaPositiva(0)).toBe(false);
  });

  it('retorna false para número negativo', () => {
    expect(cargaPositiva(-5)).toBe(false);
  });

  it('retorna false para string', () => {
    expect(cargaPositiva('80')).toBe(false);
  });
});
