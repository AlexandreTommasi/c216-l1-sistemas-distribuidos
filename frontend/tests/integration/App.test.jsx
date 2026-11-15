import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";

afterEach(() => vi.unstubAllGlobals());

// ---------------------------------------------------------------------------
// Helper: configura o fetch global para responder sequencialmente
// ---------------------------------------------------------------------------

function stubFetch(...responses) {
  let i = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      const { status, body } = responses[Math.min(i++, responses.length - 1)];
      return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(body),
      });
    }),
  );
}

const PIKACHU = { numero: 25, nome: "Pikachu", tipos: ["Elétrico"] };

// ---------------------------------------------------------------------------
// Carregamento inicial
// ---------------------------------------------------------------------------

describe("carregamento inicial", () => {
  it("exibe o título Pokédex sempre que renderiza", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Pokédex" }),
    ).toBeInTheDocument();
  });

  it("exibe 'Carregando pokémon...' antes da resposta chegar", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    render(<App />);

    expect(screen.getByText("Carregando pokémon...")).toBeInTheDocument();
  });

  it("exibe lista vazia quando a API retorna array vazio", async () => {
    stubFetch({ status: 200, body: [] });
    render(<App />);

    expect(
      await screen.findByText("Nenhum pokémon cadastrado."),
    ).toBeInTheDocument();
  });

  it("exibe os pokémon vindos da API", async () => {
    stubFetch({ status: 200, body: [PIKACHU] });
    render(<App />);

    expect(await screen.findByText("Pikachu")).toBeInTheDocument();
    expect(screen.getByText("#025")).toBeInTheDocument();
  });

  it("exibe alerta de erro quando a API é inacessível", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
    );
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "API inacessível",
    );
  });
});

// ---------------------------------------------------------------------------
// Validação local (não chega ao servidor)
// ---------------------------------------------------------------------------

describe("validação local", () => {
  it("não adiciona nada à lista num envio completamente vazio", async () => {
    const user = userEvent.setup();
    stubFetch({ status: 200, body: [] });
    render(<App />);

    await screen.findByText("Nenhum pokémon cadastrado.");
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getAllByRole("alert")).toHaveLength(3);
    expect(screen.getByText("Nenhum pokémon cadastrado.")).toBeInTheDocument();
  });

  it("não adiciona um pokémon sem tipo selecionado", async () => {
    const user = userEvent.setup();
    stubFetch({ status: 200, body: [] });
    render(<App />);

    await screen.findByText("Nenhum pokémon cadastrado.");
    await user.type(screen.getByLabelText("Número"), "1");
    await user.type(screen.getByLabelText("Nome"), "Bulbasaur");
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(
      screen.getByText("Selecione pelo menos um tipo."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Bulbasaur")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Cadastro
// ---------------------------------------------------------------------------

describe("cadastro", () => {
  it("adiciona pokémon com sucesso e exibe na lista", async () => {
    const user = userEvent.setup();
    stubFetch(
      { status: 200, body: [] }, // GET /pokemon no mount
      { status: 201, body: PIKACHU }, // POST /pokemon
    );
    render(<App />);

    await screen.findByText("Nenhum pokémon cadastrado.");

    await user.type(screen.getByLabelText("Número"), "25");
    await user.type(screen.getByLabelText("Nome"), "Pikachu");
    await user.click(screen.getByLabelText("Elétrico"));
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(await screen.findByText("Pikachu")).toBeInTheDocument();
    expect(screen.getByText("#025")).toBeInTheDocument();
    // formulário limpo após sucesso
    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });

  it("exibe erro do backend (409) no formulário sem apagar os campos", async () => {
    const user = userEvent.setup();
    stubFetch(
      { status: 200, body: [] },
      { status: 409, body: { detail: "numero ja existe" } },
    );
    render(<App />);

    await screen.findByText("Nenhum pokémon cadastrado.");

    await user.type(screen.getByLabelText("Número"), "25");
    await user.type(screen.getByLabelText("Nome"), "Pikachu");
    await user.click(screen.getByLabelText("Elétrico"));
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("numero ja existe"),
    );
    // campos preservados
    expect(screen.getByLabelText("Nome")).toHaveValue("Pikachu");
    expect(screen.getByLabelText("Elétrico")).toBeChecked();
    // lista não mudou
    expect(screen.getByText("Nenhum pokémon cadastrado.")).toBeInTheDocument();
  });
});
