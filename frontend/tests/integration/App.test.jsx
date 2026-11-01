import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App";

async function cadastrar(user, { numero, nome, tipos }) {
  await user.type(screen.getByLabelText("Número"), numero);
  await user.type(screen.getByLabelText("Nome"), nome);
  for (const tipo of tipos) {
    await user.click(screen.getByLabelText(tipo));
  }
  await user.click(screen.getByRole("button", { name: "Adicionar" }));
}

describe("App", () => {
  it("começa com o título e a lista vazia", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Pokédex" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nenhum pokémon cadastrado.")).toBeInTheDocument();
  });

  it("cadastra um pokémon e o exibe na lista", async () => {
    const user = userEvent.setup();
    render(<App />);

    await cadastrar(user, {
      numero: "25",
      nome: "Pikachu",
      tipos: ["Elétrico"],
    });

    expect(screen.getByText("#025")).toBeInTheDocument();
    expect(screen.getByText("Pikachu")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Tipos" })).toHaveTextContent(
      "Elétrico",
    );
    expect(
      screen.queryByText("Nenhum pokémon cadastrado."),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });

  it("acumula vários pokémon, com mais de um tipo", async () => {
    const user = userEvent.setup();
    render(<App />);

    await cadastrar(user, {
      numero: "6",
      nome: "Charizard",
      tipos: ["Fogo", "Voador"],
    });
    await cadastrar(user, { numero: "7", nome: "Squirtle", tipos: ["Água"] });

    expect(screen.getByText("#006")).toBeInTheDocument();
    expect(screen.getByText("Charizard")).toBeInTheDocument();
    expect(screen.getByText("#007")).toBeInTheDocument();
    expect(screen.getByText("Squirtle")).toBeInTheDocument();
    expect(screen.getAllByRole("list", { name: "Tipos" })).toHaveLength(2);
  });

  it("não adiciona nada à lista num envio inválido", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getAllByRole("alert")).toHaveLength(3);
    expect(screen.getByText("Nenhum pokémon cadastrado.")).toBeInTheDocument();
  });

  it("não adiciona um pokémon sem tipo", async () => {
    const user = userEvent.setup();
    render(<App />);

    await cadastrar(user, { numero: "1", nome: "Bulbasaur", tipos: [] });

    expect(
      screen.getByText("Selecione pelo menos um tipo."),
    ).toBeInTheDocument();
    expect(screen.getByText("Nenhum pokémon cadastrado.")).toBeInTheDocument();
    expect(screen.queryByText("Bulbasaur")).not.toBeInTheDocument();
  });
});
