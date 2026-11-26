import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HistoricoPage from '../pages/HistoricoPage.jsx';
import { listarSessoes } from '../services/sessoes.js';

vi.mock('../services/sessoes.js', () => ({
  listarSessoes: vi.fn(),
}));

describe('HistoricoPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  function renderPage() {
    return render(
      <MemoryRouter>
        <HistoricoPage />
      </MemoryRouter>,
    );
  }

  it('exibe indicador de carregamento enquanto o fetch está pendente', () => {
    listarSessoes.mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('exibe alert e botão de tentar de novo quando o fetch falha', async () => {
    listarSessoes.mockRejectedValue(new Error('Falha na conexão'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
    });
  });

  it('clicar em tentar de novo dispara um novo fetch', async () => {
    listarSessoes.mockRejectedValue(new Error('Falha na conexão'));
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument(),
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    await waitFor(() => expect(listarSessoes).toHaveBeenCalledTimes(2));
  });

  it('exibe botao carregar mais quando ha 20 sessoes e oculta quando ha menos', async () => {
    const sessoes20 = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      treino_nome: 'Push',
      data: `2024-01-${String(i + 1).padStart(2, '0')}`,
    }));
    listarSessoes.mockResolvedValueOnce(sessoes20);
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Carregar mais' })).toBeInTheDocument(),
    );

    listarSessoes.mockResolvedValueOnce([]);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Carregar mais' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument(),
    );
    expect(listarSessoes).toHaveBeenCalledTimes(2);
  });

  it('exibe texto de orientação quando a lista está vazia', async () => {
    listarSessoes.mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma sessão registrada ainda/)).toBeInTheDocument();
    });
  });
});
