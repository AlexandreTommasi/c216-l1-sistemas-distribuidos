// @ts-check
import { expect, test } from '@playwright/test';

async function criarTreino(page, nome) {
  await page.goto('/treinos');
  await page.getByRole('button', { name: '+ Novo' }).click();
  await page.getByLabel('Nome').fill(nome);
  await page.getByRole('button', { name: 'Criar' }).click();
  await expect(page.getByText(nome)).toBeVisible();
}

async function criarSessao(page, { nomeTreino, data }) {
  await page.goto('/sessoes/nova');
  await page.getByLabel('Treino').selectOption({ label: nomeTreino });
  if (data) {
    await page.getByLabel('Data').fill(data);
  }
  await page.getByRole('button', { name: 'Criar sessão' }).click();
  await page.waitForURL(/\/sessoes\/\d+/);
}

async function criarExercicioInline(page, nomeExercicio) {
  await page.getByLabel('Exercício').fill(nomeExercicio);
  await page.getByRole('button', { name: `Criar "${nomeExercicio}"` }).click();
  await expect(page.getByLabel('Nome do exercício')).toBeVisible();
  await page.getByRole('button', { name: 'Criar exercício' }).click();
  await expect(page.getByLabel('Carga (kg)')).toBeVisible();
}

test('1 — fluxo completo: criar treino, sessão e exercício em linha', async ({ page }) => {
  const ts = Date.now();
  const nomeTreino = `Treino E2E ${ts}`;
  const nomeEx = `Ex E2E ${ts}`;

  await criarTreino(page, nomeTreino);
  await criarSessao(page, { nomeTreino, data: '2024-06-01' });
  await criarExercicioInline(page, nomeEx);

  await page.getByLabel('Carga (kg)').fill('80');
  await page.getByLabel('Repetições').fill('10');
  await page.getByRole('button', { name: 'Registrar série' }).click();

  await expect(page.getByRole('button', { name: 'Registrar série' })).toBeEnabled();
  await expect(page.locator('li').filter({ hasText: '80' })).toBeVisible();
});

test('2 — registro em sequência: formulário permanece aberto entre séries', async ({ page }) => {
  const ts = Date.now();
  const nomeTreino = `Treino Seq ${ts}`;
  const nomeEx = `Ex Seq ${ts}`;

  await criarTreino(page, nomeTreino);
  await criarSessao(page, { nomeTreino, data: '2024-06-02' });
  await criarExercicioInline(page, nomeEx);

  // Série 1
  await page.getByLabel('Carga (kg)').fill('80');
  await page.getByLabel('Repetições').fill('10');
  await page.getByRole('button', { name: 'Registrar série' }).click();
  await expect(page.getByRole('button', { name: 'Registrar série' })).toBeEnabled();

  // Formulário permaneceu aberto e pré-preenchido
  await expect(page.getByLabel('Carga (kg)')).toHaveValue('80');
  await expect(page.getByLabel('Repetições')).toHaveValue('10');

  // Série 2
  await page.getByLabel('Carga (kg)').fill('85');
  await page.getByLabel('Repetições').fill('8');
  await page.getByRole('button', { name: 'Registrar série' }).click();
  await expect(page.getByRole('button', { name: 'Registrar série' })).toBeEnabled();

  // Série 3
  await page.getByLabel('Carga (kg)').fill('90');
  await page.getByLabel('Repetições').fill('6');
  await page.getByRole('button', { name: 'Registrar série' }).click();
  await expect(page.getByRole('button', { name: 'Registrar série' })).toBeEnabled();

  // Todas as três séries aparecem na lista
  await expect(page.locator('li').filter({ hasText: '80' })).toBeVisible();
  await expect(page.locator('li').filter({ hasText: '85' })).toBeVisible();
  await expect(page.locator('li').filter({ hasText: '90' })).toBeVisible();
});

test('3 — sugestão da sessão anterior aparece ao abrir sessão vazia', async ({ page }) => {
  const ts = Date.now();
  const nomeTreino = `Treino Sug ${ts}`;
  const nomeEx = `Ex Sug ${ts}`;

  // Sessão 1: registrar exercício com 80 kg
  await criarTreino(page, nomeTreino);
  await criarSessao(page, { nomeTreino, data: '2024-05-10' });
  await criarExercicioInline(page, nomeEx);
  await page.getByLabel('Carga (kg)').fill('80');
  await page.getByLabel('Repetições').fill('10');
  await page.getByRole('button', { name: 'Registrar série' }).click();
  await expect(page.getByRole('button', { name: 'Registrar série' })).toBeEnabled();

  // Sessão 2: data mais recente, ainda vazia
  await criarSessao(page, { nomeTreino, data: '2024-05-11' });

  // Sugestão da sessão 1 deve aparecer
  await expect(page.getByText('Sugestão — última sessão')).toBeVisible();
  await expect(page.locator('button').filter({ hasText: nomeEx })).toBeVisible();

  // Clicar na sugestão pré-preenche o formulário com a carga anterior
  await page.locator('button').filter({ hasText: nomeEx }).click();
  await expect(page.getByLabel('Carga (kg)')).toHaveValue('80');

  // Registrar com carga maior (90 kg)
  await page.getByLabel('Carga (kg)').fill('90');
  await page.getByLabel('Repetições').fill('10');
  await page.getByRole('button', { name: 'Registrar série' }).click();
  await expect(page.getByRole('button', { name: 'Registrar série' })).toBeEnabled();

  // Indicador de evolução (DeltaBadge ▲) deve aparecer
  await expect(page.getByText(/▲.*10/)).toBeVisible();
});

test('4 — rota direta no nginx carrega SPA sem 404', async ({ page }) => {
  await page.goto('/exercicios');
  await expect(page.getByRole('heading', { name: 'Exercícios' })).toBeVisible();
});
