import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SessaoPage from '../pages/SessaoPage.jsx';
import { criarExercicio, listarExercicios } from '../services/exercicios.js';
import { criarSerie, removerSerie } from '../services/series.js';
import { buscarSessao, compararSessao } from '../services/sessoes.js';
import { buscarSugestao } from '../services/treinos.js';

vi.mock('../services/sessoes.js', () => ({
  buscarSessao: vi.fn(),
  compararSessao: vi.fn(),
}));
vi.mock('../services/exercicios.js', () => ({
  listarExercicios: vi.fn(),
  criarExercicio: vi.fn(),
}));
vi.mock('../services/series.js', () => ({
  criarSerie: vi.fn(),
  removerSerie: vi.fn(),
}));
vi.mock('../services/treinos.js', () => ({
  buscarSugestao: vi.fn(),
}));

const EXERCICIOS = [{ id: 1, nome: 'Supino', grupo_muscular: 'peito' }];
const COMPARACAO = { exercicios: [] };
const SESSAO_VAZIA = { id: 1, treino_nome: 'Peito', data: '2024-01-10', series: [], treino_id: 1 };
const SERIE_1 = {
  id: 10,
  exercicio_id: 1,
  carga_kg: '80',
  repeticoes: 10,
  tipo: 'valida',
  ordem: 1,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/sessoes/1']}>
      <Routes>
        <Route path="/sessoes/:id" element={<SessaoPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function carregarPagina({ sugestoes = [] } = {}) {
  buscarSessao.mockResolvedValueOnce(SESSAO_VAZIA);
  compararSessao.mockResolvedValueOnce(COMPARACAO);
  listarExercicios.mockResolvedValueOnce(EXERCICIOS);
  buscarSugestao.mockResolvedValueOnce(sugestoes);
  renderPage();
  await screen.findByPlaceholderText('Buscar exercício...');
}

async function selecionarExercicio(user, nome = 'Supino') {
  const input = await screen.findByPlaceholderText('Buscar exercício...');
  await user.type(input, nome.slice(0, 3));
  await user.click(await screen.findByRole('button', { name: nome }));
  await screen.findByLabelText('Carga (kg)');
}

describe('SessaoPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('série aparece na lista após registrar com sucesso', async () => {
    buscarSessao.mockResolvedValueOnce(SESSAO_VAZIA);
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce(EXERCICIOS);
    buscarSugestao.mockResolvedValueOnce([]);
    criarSerie.mockResolvedValueOnce({ id: 10 });
    buscarSessao.mockResolvedValueOnce({ ...SESSAO_VAZIA, series: [SERIE_1] });
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce(EXERCICIOS);

    renderPage();
    const user = userEvent.setup();
    await selecionarExercicio(user);

    await user.type(screen.getByLabelText('Carga (kg)'), '80');
    await user.type(screen.getByLabelText('Repetições'), '10');
    await user.click(screen.getByRole('button', { name: 'Registrar série' }));

    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
    expect(criarSerie).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ carga_kg: 80, repeticoes: 10 }),
    );
  });

  it('aceita carga com incremento de micro anilha (1.25 kg)', async () => {
    buscarSessao.mockResolvedValueOnce(SESSAO_VAZIA);
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce(EXERCICIOS);
    buscarSugestao.mockResolvedValueOnce([]);
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
    const user = userEvent.setup();
    await selecionarExercicio(user);

    await user.type(screen.getByLabelText('Carga (kg)'), '1.25');
    await user.type(screen.getByLabelText('Repetições'), '8');
    await user.click(screen.getByRole('button', { name: 'Registrar série' }));

    await waitFor(() => expect(screen.getByText('1.25')).toBeInTheDocument());
    expect(criarSerie).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ carga_kg: 1.25, repeticoes: 8 }),
    );
  });

  it('mantém os valores do formulário quando o POST falha', async () => {
    await carregarPagina();
    const user = userEvent.setup();
    await selecionarExercicio(user);

    criarSerie.mockRejectedValueOnce(new Error('Exercício não encontrado'));

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
    const user = userEvent.setup();
    await selecionarExercicio(user);

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

    await user.type(screen.getByLabelText('Carga (kg)'), '80');
    await user.type(screen.getByLabelText('Repetições'), '10');
    await user.click(screen.getByRole('button', { name: 'Registrar série' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled());

    resolvePost({ id: 1 });
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Registrar série' })).not.toBeDisabled(),
    );
  });

  it('formulário continua aberto e pré-preenchido depois de salvar uma série', async () => {
    buscarSessao.mockResolvedValueOnce(SESSAO_VAZIA);
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce(EXERCICIOS);
    buscarSugestao.mockResolvedValueOnce([]);
    criarSerie.mockResolvedValueOnce({ id: 10 });
    buscarSessao.mockResolvedValueOnce({ ...SESSAO_VAZIA, series: [SERIE_1] });
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce(EXERCICIOS);

    renderPage();
    const user = userEvent.setup();
    await selecionarExercicio(user);

    await user.type(screen.getByLabelText('Carga (kg)'), '80');
    await user.type(screen.getByLabelText('Repetições'), '10');
    await user.click(screen.getByRole('button', { name: 'Registrar série' }));

    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());

    expect(screen.getByLabelText('Carga (kg)')).toHaveValue(80);
    expect(screen.getByLabelText('Repetições')).toHaveValue(10);
    expect(screen.getByRole('button', { name: 'Registrar série' })).toBeInTheDocument();
  });

  it('criar exercício de dentro da sessão e já poder registrar série nele', async () => {
    buscarSessao.mockResolvedValueOnce(SESSAO_VAZIA);
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce(EXERCICIOS);
    buscarSugestao.mockResolvedValueOnce([]);

    const NOVO_EX = { id: 99, nome: 'Leg Press', grupo_muscular: 'pernas' };
    criarExercicio.mockResolvedValueOnce(NOVO_EX);
    listarExercicios.mockResolvedValueOnce([...EXERCICIOS, NOVO_EX]);

    criarSerie.mockResolvedValueOnce({ id: 50 });
    buscarSessao.mockResolvedValueOnce({
      ...SESSAO_VAZIA,
      series: [
        { id: 50, exercicio_id: 99, carga_kg: '100', repeticoes: 5, tipo: 'valida', ordem: 1 },
      ],
    });
    compararSessao.mockResolvedValueOnce(COMPARACAO);
    listarExercicios.mockResolvedValueOnce([...EXERCICIOS, NOVO_EX]);

    renderPage();
    const user = userEvent.setup();
    await screen.findByPlaceholderText('Buscar exercício...');

    await user.type(screen.getByPlaceholderText('Buscar exercício...'), 'Leg Press');
    await user.click(await screen.findByRole('button', { name: /Criar "Leg Press"/ }));

    await screen.findByLabelText('Nome do exercício');
    expect(screen.getByLabelText('Nome do exercício')).toHaveValue('Leg Press');

    await user.click(screen.getByRole('button', { name: 'Criar exercício' }));

    await screen.findByLabelText('Carga (kg)');

    await user.type(screen.getByLabelText('Carga (kg)'), '100');
    await user.type(screen.getByLabelText('Repetições'), '5');
    await user.click(screen.getByRole('button', { name: 'Registrar série' }));

    await waitFor(() => expect(criarSerie).toHaveBeenCalledOnce());
    expect(criarSerie).toHaveBeenCalledWith(1, expect.objectContaining({ exercicio_id: 99 }));
  });

  it('sessão vazia de treino com histórico mostra os exercícios sugeridos', async () => {
    const SUGESTOES = [
      {
        exercicio_id: 1,
        nome: 'Supino',
        grupo_muscular: 'peito',
        carga_kg: '80.000',
        repeticoes: 8,
        series_validas: 3,
      },
    ];
    await carregarPagina({ sugestoes: SUGESTOES });

    expect(screen.getByText('Sugestão — última sessão')).toBeInTheDocument();
    expect(screen.getByText('Supino')).toBeInTheDocument();
    expect(screen.getByText(/80.*kg.*×.*8/)).toBeInTheDocument();
  });

  it('sessão vazia de treino sem histórico não mostra sugestão nem erro', async () => {
    await carregarPagina({ sugestoes: [] });

    expect(screen.queryByText(/Sugestão/)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar exercício...')).toBeInTheDocument();
  });
});
