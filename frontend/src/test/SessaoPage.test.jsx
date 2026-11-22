import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SessaoPage from '../pages/SessaoPage.jsx';
import { listarExercicios } from '../services/exercicios.js';
import { criarSerie } from '../services/series.js';
import { buscarSessao, compararSessao } from '../services/sessoes.js';

vi.mock('../services/sessoes.js', () => ({
  buscarSessao: vi.fn(),
  compararSessao: vi.fn(),
}));
vi.mock('../services/exercicios.js', () => ({
  listarExercicios: vi.fn(),
}));
vi.mock('../services/series.js', () => ({
  criarSerie: vi.fn(),
  removerSerie: vi.fn(),
}));

const EXERCICIOS = [{ id: 1, nome: 'Supino', grupo_muscular: 'peito' }];
const COMPARACAO = { exercicios: [], volume_total_kg: '0' };
const SESSAO_VAZIA = {
  id: 1,
  treino_nome: 'Peito',
  data: '2024-01-10',
  series: [],
  treino_id: 1,
};

describe('SessaoPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={['/sessoes/1']}>
        <Routes>
          <Route path="/sessoes/:id" element={<SessaoPage />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  async function carregarPagina() {
    buscarSessao.mockResolvedValueOnce(SESSAO_VAZIA);
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce(EXERCICIOS);
    renderPage();
    await screen.findByLabelText('Carga (kg)');
  }

  it('série aparece na lista após registrar com sucesso', async () => {
    buscarSessao.mockResolvedValueOnce(SESSAO_VAZIA);
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce(EXERCICIOS);
    criarSerie.mockResolvedValueOnce({ id: 10 });
    buscarSessao.mockResolvedValueOnce({
      ...SESSAO_VAZIA,
      series: [
        { id: 10, exercicio_id: 1, carga_kg: '80', repeticoes: 10, tipo: 'valida', ordem: 1 },
      ],
    });
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce(EXERCICIOS);

    renderPage();
    await screen.findByLabelText('Carga (kg)');

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Carga (kg)'), '80');
    await user.type(screen.getByLabelText('Repetições'), '10');
    await user.click(screen.getByRole('button', { name: 'Registrar série' }));

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });
    expect(criarSerie).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ carga_kg: 80, repeticoes: 10 }),
    );
  });

  it('aceita carga com incremento de micro anilha (1.25 kg)', async () => {
    buscarSessao.mockResolvedValueOnce(SESSAO_VAZIA);
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce(EXERCICIOS);
    criarSerie.mockResolvedValueOnce({ id: 11 });
    buscarSessao.mockResolvedValueOnce({
      ...SESSAO_VAZIA,
      series: [
        { id: 11, exercicio_id: 1, carga_kg: '1.25', repeticoes: 8, tipo: 'valida', ordem: 1 },
      ],
    });
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce(EXERCICIOS);

    renderPage();
    await screen.findByLabelText('Carga (kg)');

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Carga (kg)'), '1.25');
    await user.type(screen.getByLabelText('Repetições'), '8');
    await user.click(screen.getByRole('button', { name: 'Registrar série' }));

    await waitFor(() => {
      expect(screen.getByText('1.25')).toBeInTheDocument();
    });
    expect(criarSerie).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ carga_kg: 1.25, repeticoes: 8 }),
    );
  });

  it('mantém os valores do formulário quando o POST falha', async () => {
    await carregarPagina();
    criarSerie.mockRejectedValueOnce(new Error('Exercício não encontrado'));

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Carga (kg)'), '80');
    await user.type(screen.getByLabelText('Repetições'), '10');
    await user.click(screen.getByRole('button', { name: 'Registrar série' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Exercício não encontrado'),
    );
    expect(screen.getByLabelText('Carga (kg)')).toHaveValue(80);
    expect(screen.getByLabelText('Repetições')).toHaveValue(10);
  });

  it('botão fica desabilitado enquanto o POST está pendente', async () => {
    await carregarPagina();

    let resolvePost;
    criarSerie.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        }),
    );
    buscarSessao.mockResolvedValue(SESSAO_VAZIA);
    compararSessao.mockResolvedValue(COMPARACAO);
    listarExercicios.mockResolvedValue(EXERCICIOS);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Carga (kg)'), '80');
    await user.type(screen.getByLabelText('Repetições'), '10');
    await user.click(screen.getByRole('button', { name: 'Registrar série' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled());

    resolvePost({ id: 1 });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Registrar série' })).not.toBeDisabled(),
    );
  });
});
