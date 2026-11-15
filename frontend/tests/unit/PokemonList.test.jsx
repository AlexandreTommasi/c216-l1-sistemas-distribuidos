import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PokemonList from "../../src/components/PokemonList";

describe("PokemonList", () => {
  it("mostra a mensagem de estado vazio", () => {
    render(<PokemonList pokemons={[]} />);

    expect(screen.getByText("Nenhum pokémon cadastrado.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("lista número formatado, nome e tipos de cada pokémon", () => {
    render(
      <PokemonList
        pokemons={[
          { numero: 1, nome: "Bulbasaur", tipos: ["Grama", "Veneno"] },
          { numero: 25, nome: "Pikachu", tipos: ["Elétrico"] },
          { numero: 150, nome: "Mewtwo", tipos: ["Psíquico"] },
        ]}
      />,
    );

    expect(
      screen.queryByText("Nenhum pokémon cadastrado."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("#001")).toBeInTheDocument();
    expect(screen.getByText("#025")).toBeInTheDocument();
    expect(screen.getByText("#150")).toBeInTheDocument();
    expect(screen.getByText("Bulbasaur")).toBeInTheDocument();
    expect(screen.getByText("Pikachu")).toBeInTheDocument();
    expect(screen.getByText("Mewtwo")).toBeInTheDocument();
  });

  it("exibe todos os tipos de um pokémon", () => {
    render(
      <PokemonList
        pokemons={[
          { numero: 1, nome: "Bulbasaur", tipos: ["Grama", "Veneno"] },
        ]}
      />,
    );

    const tipos = within(screen.getByRole("list", { name: "Tipos" }));
    expect(tipos.getAllByRole("listitem")).toHaveLength(2);
    expect(tipos.getByText("Grama")).toBeInTheDocument();
    expect(tipos.getByText("Veneno")).toBeInTheDocument();
  });

  it("não corta números com mais de três dígitos", () => {
    render(
      <PokemonList
        pokemons={[{ numero: 1025, nome: "Pecharunt", tipos: ["Veneno"] }]}
      />,
    );

    expect(screen.getByText("#1025")).toBeInTheDocument();
  });
});
