const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch {
    throw new Error("API inacessível. Verifique sua conexão.");
  }

  if (!response.ok) {
    let detail = `Erro ${response.status}`;
    try {
      const body = await response.json();
      if (body.detail) detail = body.detail;
    } catch {
      // mantém o detail genérico se o corpo não for JSON
    }
    throw new Error(detail);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function listPokemon() {
  return request("/pokemon");
}

export function createPokemon(data) {
  return request("/pokemon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function updatePokemon(numero, data) {
  return request(`/pokemon/${numero}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function deletePokemon(numero) {
  return request(`/pokemon/${numero}`, { method: "DELETE" });
}
