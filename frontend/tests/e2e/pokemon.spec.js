import { expect, test } from "@playwright/test";

// Números únicos por execução para não colidir com o seed (1,4,7,25,39,143)
// nem com outras execuções paralelas.
const NUM_A = 1000 + (Date.now() % 8000);
const NUM_B = NUM_A + 1;

function formatNumero(n) {
  return `#${String(n).padStart(3, "0")}`;
}

test.describe("Pokédex E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Aguarda o carregamento inicial resolver antes de cada cenário.
    await expect(page.getByText("Carregando pokémon...")).toBeHidden();
  });

  // ---------------------------------------------------------------------------
  // Validação local — não chega ao servidor
  // ---------------------------------------------------------------------------

  test("exibe erros de validação sem submeter ao servidor", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Adicionar" }).click();

    await expect(page.getByText("O número é obrigatório.")).toBeVisible();
    await expect(page.getByText("O nome é obrigatório.")).toBeVisible();
    await expect(page.getByText("Selecione pelo menos um tipo.")).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(3);
  });

  // ---------------------------------------------------------------------------
  // Persistência real: cadastra → aparece → reload → continua lá
  // ---------------------------------------------------------------------------

  test("cadastra pokémon e persiste após reload", async ({ page }) => {
    await page.getByLabel("Número").fill(String(NUM_A));
    await page.getByLabel("Nome").fill("TestePersistente");
    await page.getByLabel("Normal").check({ force: true });
    await page.getByRole("button", { name: "Adicionar" }).click();

    // Aparece na listagem imediatamente após o POST
    await expect(page.getByText(formatNumero(NUM_A))).toBeVisible();
    await expect(page.getByText("TestePersistente")).toBeVisible();
    // Formulário foi limpo
    await expect(page.getByLabel("Nome")).toHaveValue("");

    // Após reload os dados vêm da API (que lê o banco)
    await page.reload();
    await expect(page.getByText("Carregando pokémon...")).toBeHidden();
    await expect(page.getByText(formatNumero(NUM_A))).toBeVisible();
    await expect(page.getByText("TestePersistente")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Erro de número duplicado vindo da API (409)
  // ---------------------------------------------------------------------------

  test("exibe erro de número duplicado vindo da API", async ({ page }) => {
    // Cria o pokémon original com sucesso
    await page.getByLabel("Número").fill(String(NUM_B));
    await page.getByLabel("Nome").fill("PokemonOriginal");
    await page.getByLabel("Normal").check({ force: true });
    await page.getByRole("button", { name: "Adicionar" }).click();
    await expect(page.getByText("PokemonOriginal")).toBeVisible();

    // Segunda tentativa com o mesmo número deve retornar 409
    await page.getByLabel("Número").fill(String(NUM_B));
    await page.getByLabel("Nome").fill("PokemonDuplicado");
    await page.getByLabel("Normal").check({ force: true });
    await page.getByRole("button", { name: "Adicionar" }).click();

    await expect(page.getByRole("alert")).toContainText("numero ja existe");
    // Campos preservados após o erro
    await expect(page.getByLabel("Nome")).toHaveValue("PokemonDuplicado");
  });
});
