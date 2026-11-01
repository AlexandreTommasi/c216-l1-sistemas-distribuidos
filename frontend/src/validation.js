export const NOME_MAX_LENGTH = 100;

export const TIPOS_DISPONIVEIS = [
  "Fogo",
  "Água",
  "Grama",
  "Elétrico",
  "Normal",
  "Voador",
  "Veneno",
  "Fada",
  "Psíquico",
  "Pedra",
  "Terra",
  "Lutador",
];

export function validatePokemon({ numero, nome, tipos }) {
  const errors = {};

  const numeroTexto = String(numero ?? "").trim();
  const numeroInteiro = /^\d+$/.test(numeroTexto) ? Number(numeroTexto) : null;
  if (numeroTexto === "") {
    errors.numero = "O número é obrigatório.";
  } else if (numeroInteiro === null || numeroInteiro < 1) {
    errors.numero = "O número deve ser um inteiro positivo.";
  }

  const nomeLimpo = String(nome ?? "").trim();
  if (nomeLimpo === "") {
    errors.nome = "O nome é obrigatório.";
  } else if (nomeLimpo.length > NOME_MAX_LENGTH) {
    errors.nome = `O nome deve ter no máximo ${NOME_MAX_LENGTH} caracteres.`;
  }

  const tiposSelecionados = Array.isArray(tipos) ? tipos : [];
  if (tiposSelecionados.length === 0) {
    errors.tipos = "Selecione pelo menos um tipo.";
  }

  return {
    errors,
    values: {
      numero: numeroInteiro,
      nome: nomeLimpo,
      tipos: tiposSelecionados,
    },
  };
}
