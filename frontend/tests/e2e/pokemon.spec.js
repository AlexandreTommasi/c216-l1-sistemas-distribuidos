import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("carrega a interface com o estado vazio", async ({ page }) => {
  await expect(
    page.getByRole("heading", { level: 1, name: "Pokédex" }),
  ).toBeVisible();
  await expect(page.getByLabel("Número")).toBeVisible();
  await expect(page.getByLabel("Nome")).toBeVisible();
  await expect(page.getByText("Nenhum pokémon cadastrado.")).toBeVisible();
});

test("cadastra um pokémon e o exibe na listagem", async ({ page }) => {
  await page.getByLabel("Número").fill("6");
  await page.getByLabel("Nome").fill("Charizard");
  await page.getByLabel("Fogo").check({ force: true });
  await page.getByLabel("Voador").check({ force: true });
  await page.getByRole("button", { name: "Adicionar" }).click();

  const tipos = page.getByRole("list", { name: "Tipos" });
  await expect(page.getByText("#006")).toBeVisible();
  await expect(page.getByText("Charizard")).toBeVisible();
  await expect(tipos.getByText("Fogo")).toBeVisible();
  await expect(tipos.getByText("Voador")).toBeVisible();
  await expect(page.getByText("Nenhum pokémon cadastrado.")).toBeHidden();
  await expect(page.getByLabel("Nome")).toHaveValue("");
});

test("exibe erros de validação e não adiciona nada", async ({ page }) => {
  await page.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByText("O número é obrigatório.")).toBeVisible();
  await expect(page.getByText("O nome é obrigatório.")).toBeVisible();
  await expect(page.getByText("Selecione pelo menos um tipo.")).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(3);
  await expect(page.getByText("Nenhum pokémon cadastrado.")).toBeVisible();
});
