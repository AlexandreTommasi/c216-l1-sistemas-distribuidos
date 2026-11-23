# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sessao.spec.js >> 2 — registro em sequência: formulário permanece aberto entre séries
- Location: e2e\sessao.spec.js:47:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/treinos
Call log:
  - navigating to "http://localhost:5173/treinos", waiting until "load"

```

# Test source

```ts
  1   | // @ts-check
  2   | import { expect, test } from '@playwright/test';
  3   | 
  4   | async function criarTreino(page, nome) {
> 5   |   await page.goto('/treinos');
      |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/treinos
  6   |   await page.getByRole('button', { name: '+ Novo' }).click();
  7   |   await page.getByLabel('Nome').fill(nome);
  8   |   await page.getByRole('button', { name: 'Criar' }).click();
  9   |   await expect(page.getByText(nome)).toBeVisible();
  10  | }
  11  | 
  12  | async function criarSessao(page, { nomeTreino, data }) {
  13  |   await page.goto('/sessoes/nova');
  14  |   await page.getByLabel('Treino').selectOption({ label: nomeTreino });
  15  |   if (data) {
  16  |     await page.getByLabel('Data').fill(data);
  17  |   }
  18  |   await page.getByRole('button', { name: 'Criar sessão' }).click();
  19  |   await page.waitForURL(/\/sessoes\/\d+/);
  20  | }
  21  | 
  22  | async function criarExercicioInline(page, nomeExercicio) {
  23  |   await page.getByLabel('Exercício').fill(nomeExercicio);
  24  |   await page.getByRole('button', { name: `Criar "${nomeExercicio}"` }).click();
  25  |   await expect(page.getByLabel('Nome do exercício')).toBeVisible();
  26  |   await page.getByRole('button', { name: 'Criar exercício' }).click();
  27  |   await expect(page.getByLabel('Carga (kg)')).toBeVisible();
  28  | }
  29  | 
  30  | test('1 — fluxo completo: criar treino, sessão e exercício em linha', async ({ page }) => {
  31  |   const ts = Date.now();
  32  |   const nomeTreino = `Treino E2E ${ts}`;
  33  |   const nomeEx = `Ex E2E ${ts}`;
  34  | 
  35  |   await criarTreino(page, nomeTreino);
  36  |   await criarSessao(page, { nomeTreino, data: '2024-06-01' });
  37  |   await criarExercicioInline(page, nomeEx);
  38  | 
  39  |   await page.getByLabel('Carga (kg)').fill('80');
  40  |   await page.getByLabel('Repetições').fill('10');
  41  |   await page.getByRole('button', { name: 'Registrar série' }).click();
  42  | 
  43  |   await expect(page.getByRole('button', { name: 'Registrar série' })).toBeEnabled();
  44  |   await expect(page.locator('li').filter({ hasText: '80' })).toBeVisible();
  45  | });
  46  | 
  47  | test('2 — registro em sequência: formulário permanece aberto entre séries', async ({ page }) => {
  48  |   const ts = Date.now();
  49  |   const nomeTreino = `Treino Seq ${ts}`;
  50  |   const nomeEx = `Ex Seq ${ts}`;
  51  | 
  52  |   await criarTreino(page, nomeTreino);
  53  |   await criarSessao(page, { nomeTreino, data: '2024-06-02' });
  54  |   await criarExercicioInline(page, nomeEx);
  55  | 
  56  |   // Série 1
  57  |   await page.getByLabel('Carga (kg)').fill('80');
  58  |   await page.getByLabel('Repetições').fill('10');
  59  |   await page.getByRole('button', { name: 'Registrar série' }).click();
  60  |   await expect(page.getByRole('button', { name: 'Registrar série' })).toBeEnabled();
  61  | 
  62  |   // Formulário permaneceu aberto e pré-preenchido
  63  |   await expect(page.getByLabel('Carga (kg)')).toHaveValue('80');
  64  |   await expect(page.getByLabel('Repetições')).toHaveValue('10');
  65  | 
  66  |   // Série 2
  67  |   await page.getByLabel('Carga (kg)').fill('85');
  68  |   await page.getByLabel('Repetições').fill('8');
  69  |   await page.getByRole('button', { name: 'Registrar série' }).click();
  70  |   await expect(page.getByRole('button', { name: 'Registrar série' })).toBeEnabled();
  71  | 
  72  |   // Série 3
  73  |   await page.getByLabel('Carga (kg)').fill('90');
  74  |   await page.getByLabel('Repetições').fill('6');
  75  |   await page.getByRole('button', { name: 'Registrar série' }).click();
  76  |   await expect(page.getByRole('button', { name: 'Registrar série' })).toBeEnabled();
  77  | 
  78  |   // Todas as três séries aparecem na lista
  79  |   await expect(page.locator('li').filter({ hasText: '80' })).toBeVisible();
  80  |   await expect(page.locator('li').filter({ hasText: '85' })).toBeVisible();
  81  |   await expect(page.locator('li').filter({ hasText: '90' })).toBeVisible();
  82  | });
  83  | 
  84  | test('3 — sugestão da sessão anterior aparece ao abrir sessão vazia', async ({ page }) => {
  85  |   const ts = Date.now();
  86  |   const nomeTreino = `Treino Sug ${ts}`;
  87  |   const nomeEx = `Ex Sug ${ts}`;
  88  | 
  89  |   // Sessão 1: registrar exercício com 80 kg
  90  |   await criarTreino(page, nomeTreino);
  91  |   await criarSessao(page, { nomeTreino, data: '2024-05-10' });
  92  |   await criarExercicioInline(page, nomeEx);
  93  |   await page.getByLabel('Carga (kg)').fill('80');
  94  |   await page.getByLabel('Repetições').fill('10');
  95  |   await page.getByRole('button', { name: 'Registrar série' }).click();
  96  |   await expect(page.getByRole('button', { name: 'Registrar série' })).toBeEnabled();
  97  | 
  98  |   // Sessão 2: data mais recente, ainda vazia
  99  |   await criarSessao(page, { nomeTreino, data: '2024-05-11' });
  100 | 
  101 |   // Sugestão da sessão 1 deve aparecer
  102 |   await expect(page.getByText('Sugestão — última sessão')).toBeVisible();
  103 |   await expect(page.locator('button').filter({ hasText: nomeEx })).toBeVisible();
  104 | 
  105 |   // Clicar na sugestão pré-preenche o formulário com a carga anterior
```