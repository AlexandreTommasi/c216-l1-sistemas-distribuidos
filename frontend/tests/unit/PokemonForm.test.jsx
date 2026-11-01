import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PokemonForm from "../../src/components/PokemonForm";

function setup() {
  const onAdd = vi.fn();
  const user = userEvent.setup();
  render(<PokemonForm onAdd={onAdd} />);
  return { onAdd, user };
}

const adicionar = () => screen.getByRole("button", { name: "Adicionar" });

describe("PokemonForm", () => {
  it("renderiza os campos com rótulo e os doze tipos", () => {
    setup();

    expect(screen.getByLabelText("Número")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(12);
    expect(screen.getByLabelText("Água")).not.toBeChecked();
  });

  it("mostra os erros e não chama onAdd com formulário vazio", async () => {
    const { onAdd, user } = setup();

    await user.click(adicionar());

    expect(screen.getByText("O número é obrigatório.")).toBeInTheDocument();
    expect(screen.getByText("O nome é obrigatório.")).toBeInTheDocument();
    expect(
      screen.getByText("Selecione pelo menos um tipo."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("alert")).toHaveLength(3);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("marca os campos inválidos e os associa à mensagem de erro", async () => {
    const { user } = setup();

    await user.click(adicionar());

    const numero = screen.getByLabelText("Número");
    expect(numero).toHaveAttribute("aria-invalid", "true");
    expect(numero).toHaveAccessibleDescription("O número é obrigatório.");
    expect(screen.getByLabelText("Nome")).toHaveAccessibleDescription(
      "O nome é obrigatório.",
    );
  });

  it("rejeita número zero sem chamar onAdd", async () => {
    const { onAdd, user } = setup();

    await user.type(screen.getByLabelText("Número"), "0");
    await user.type(screen.getByLabelText("Nome"), "Missingno");
    await user.click(screen.getByLabelText("Normal"));
    await user.click(adicionar());

    expect(
      screen.getByText("O número deve ser um inteiro positivo."),
    ).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("chama onAdd com os valores corretos e limpa o formulário", async () => {
    const { onAdd, user } = setup();

    await user.type(screen.getByLabelText("Número"), "6");
    await user.type(screen.getByLabelText("Nome"), "  Charizard ");
    await user.click(screen.getByLabelText("Fogo"));
    await user.click(screen.getByLabelText("Voador"));
    await user.click(adicionar());

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith({
      numero: 6,
      nome: "Charizard",
      tipos: ["Fogo", "Voador"],
    });
    expect(screen.getByLabelText("Número")).toHaveValue(null);
    expect(screen.getByLabelText("Nome")).toHaveValue("");
    expect(screen.getByLabelText("Fogo")).not.toBeChecked();
    expect(screen.getByLabelText("Voador")).not.toBeChecked();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("alterna a seleção de um tipo ao clicar duas vezes", async () => {
    const { onAdd, user } = setup();

    await user.click(screen.getByLabelText("Grama"));
    expect(screen.getByLabelText("Grama")).toBeChecked();
    await user.click(screen.getByLabelText("Grama"));
    expect(screen.getByLabelText("Grama")).not.toBeChecked();

    await user.type(screen.getByLabelText("Número"), "1");
    await user.type(screen.getByLabelText("Nome"), "Bulbasaur");
    await user.click(adicionar());

    expect(
      screen.getByText("Selecione pelo menos um tipo."),
    ).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("limpa os erros depois de um envio válido", async () => {
    const { onAdd, user } = setup();

    await user.click(adicionar());
    expect(screen.getAllByRole("alert")).toHaveLength(3);

    await user.type(screen.getByLabelText("Número"), "25");
    await user.type(screen.getByLabelText("Nome"), "Pikachu");
    await user.click(screen.getByLabelText("Elétrico"));
    await user.click(adicionar());

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
