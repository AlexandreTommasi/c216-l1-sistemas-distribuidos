import { describe, expect, it } from "vitest";
import {
  NOME_MAX_LENGTH,
  TIPOS_DISPONIVEIS,
  validatePokemon,
} from "../../src/validation";

const valido = { numero: "25", nome: "Pikachu", tipos: ["Elétrico"] };

describe("validatePokemon", () => {
  it("aceita um pokémon válido e normaliza os valores", () => {
    const { errors, values } = validatePokemon({
      numero: "25",
      nome: "  Pikachu  ",
      tipos: ["Elétrico"],
    });

    expect(errors).toEqual({});
    expect(values).toEqual({
      numero: 25,
      nome: "Pikachu",
      tipos: ["Elétrico"],
    });
  });

  it("aceita número já informado como inteiro", () => {
    const { errors, values } = validatePokemon({ ...valido, numero: 7 });

    expect(errors).toEqual({});
    expect(values.numero).toBe(7);
  });

  it.each([
    ["vazio", ""],
    ["só espaços", "   "],
    ["undefined", undefined],
  ])("rejeita número ausente (%s)", (_descricao, numero) => {
    const { errors } = validatePokemon({ ...valido, numero });

    expect(errors.numero).toBe("O número é obrigatório.");
  });

  it.each([
    ["zero", "0"],
    ["negativo", "-5"],
    ["decimal", "1.5"],
    ["texto", "abc"],
    ["misto", "12abc"],
  ])("rejeita número inválido (%s)", (_descricao, numero) => {
    const { errors } = validatePokemon({ ...valido, numero });

    expect(errors.numero).toBe("O número deve ser um inteiro positivo.");
  });

  it.each([
    ["vazio", ""],
    ["só espaços", "    "],
  ])("rejeita nome %s", (_descricao, nome) => {
    const { errors } = validatePokemon({ ...valido, nome });

    expect(errors.nome).toBe("O nome é obrigatório.");
  });

  it("aceita nome com exatamente o limite de caracteres", () => {
    const { errors } = validatePokemon({
      ...valido,
      nome: "a".repeat(NOME_MAX_LENGTH),
    });

    expect(errors.nome).toBeUndefined();
  });

  it("rejeita nome acima do limite de caracteres", () => {
    const { errors } = validatePokemon({
      ...valido,
      nome: "a".repeat(NOME_MAX_LENGTH + 1),
    });

    expect(errors.nome).toBe(
      `O nome deve ter no máximo ${NOME_MAX_LENGTH} caracteres.`,
    );
  });

  it("ignora espaços nas pontas ao contar o limite do nome", () => {
    const { errors } = validatePokemon({
      ...valido,
      nome: ` ${"a".repeat(NOME_MAX_LENGTH)} `,
    });

    expect(errors.nome).toBeUndefined();
  });

  it.each([
    ["lista vazia", []],
    ["undefined", undefined],
  ])("rejeita tipos ausentes (%s)", (_descricao, tipos) => {
    const { errors } = validatePokemon({ ...valido, tipos });

    expect(errors.tipos).toBe("Selecione pelo menos um tipo.");
  });

  it("acumula os erros de todos os campos", () => {
    const { errors } = validatePokemon({ numero: "", nome: "", tipos: [] });

    expect(Object.keys(errors).sort()).toEqual(["nome", "numero", "tipos"]);
  });
});

describe("constantes", () => {
  it("limita o nome a 100 caracteres", () => {
    expect(NOME_MAX_LENGTH).toBe(100);
  });

  it("lista os doze tipos disponíveis", () => {
    expect(TIPOS_DISPONIVEIS).toHaveLength(12);
    expect(TIPOS_DISPONIVEIS).toContain("Fogo");
    expect(TIPOS_DISPONIVEIS).toContain("Psíquico");
  });
});
