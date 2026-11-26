import { afterEach, describe, expect, it, vi } from 'vitest';
import { get } from '../services/client.js';

describe('cliente HTTP', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resposta 200 devolve JSON', async () => {
    vi.stubGlobal('fetch', async () => ({
      ok: true,
      status: 200,
      json: async () => ({ id: 1 }),
    }));
    const result = await get('/teste');
    expect(result).toEqual({ id: 1 });
  });

  it('resposta 204 devolve null sem chamar .json()', async () => {
    const jsonSpy = vi.fn();
    vi.stubGlobal('fetch', async () => ({
      ok: true,
      status: 204,
      json: jsonSpy,
    }));
    const result = await get('/teste');
    expect(result).toBeNull();
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it('erro com detail lança Error com a mensagem exata do backend', async () => {
    vi.stubGlobal('fetch', async () => ({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ detail: 'Carga inválida' }),
    }));
    await expect(get('/teste')).rejects.toThrow('Carga inválida');
  });

  it('erro sem detail lança Error mencionando o status', async () => {
    vi.stubGlobal('fetch', async () => ({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    }));
    await expect(get('/teste')).rejects.toThrow('500');
  });

  it('URL não tem barra final', async () => {
    let urlChamada;
    vi.stubGlobal('fetch', async (url) => {
      urlChamada = url;
      return { ok: true, status: 200, json: async () => ({}) };
    });
    await get('/sessoes');
    expect(urlChamada).not.toMatch(/\/$/);
    expect(urlChamada).toMatch(/\/sessoes$/);
  });
});
