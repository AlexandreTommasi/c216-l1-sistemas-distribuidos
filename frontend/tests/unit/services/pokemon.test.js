import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createPokemon,
  deletePokemon,
  listPokemon,
  updatePokemon,
} from "../../../src/services/pokemon";

const BASE = "http://localhost:8000";

function jsonResp(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

afterEach(() => vi.unstubAllGlobals());

// ---------------------------------------------------------------------------
// listPokemon
// ---------------------------------------------------------------------------

describe("listPokemon", () => {
  it("faz GET /pokemon e retorna a lista", async () => {
    const data = [{ numero: 1, nome: "Bulbasaur", tipos: ["Grama"] }];
    vi.stubGlobal(
      "fetch",
      vi.fn(() => jsonResp(200, data)),
    );

    const result = await listPokemon();

    expect(result).toEqual(data);
    expect(fetch).toHaveBeenCalledWith(`${BASE}/pokemon`, {});
  });
});

// ---------------------------------------------------------------------------
// createPokemon
// ---------------------------------------------------------------------------

describe("createPokemon", () => {
  it("faz POST /pokemon com o corpo e os headers corretos", async () => {
    const payload = { numero: 25, nome: "Pikachu", tipos: ["Elétrico"] };
    vi.stubGlobal(
      "fetch",
      vi.fn(() => jsonResp(201, payload)),
    );

    const result = await createPokemon(payload);

    expect(result).toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/pokemon`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );
  });

  it("lança erro com o campo detail em resposta 409", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => jsonResp(409, { detail: "numero ja existe" })),
    );

    await expect(
      createPokemon({ numero: 1, nome: "X", tipos: [] }),
    ).rejects.toThrow("numero ja existe");
  });

  it("lança erro genérico quando o body não tem detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => jsonResp(500, {})),
    );

    await expect(
      createPokemon({ numero: 1, nome: "X", tipos: [] }),
    ).rejects.toThrow("Erro 500");
  });
});

// ---------------------------------------------------------------------------
// updatePokemon
// ---------------------------------------------------------------------------

describe("updatePokemon", () => {
  it("faz PATCH /pokemon/:numero com o corpo correto", async () => {
    const patch = { nome: "Raichu" };
    vi.stubGlobal(
      "fetch",
      vi.fn(() => jsonResp(200, { ...patch, numero: 25 })),
    );

    await updatePokemon(25, patch);

    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/pokemon/25`,
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// deletePokemon
// ---------------------------------------------------------------------------

describe("deletePokemon", () => {
  it("faz DELETE /pokemon/:numero e retorna null no 204", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 204,
          json: () => Promise.resolve(null),
        }),
      ),
    );

    const result = await deletePokemon(25);

    expect(result).toBeNull();
    expect(fetch).toHaveBeenCalledWith(`${BASE}/pokemon/25`, {
      method: "DELETE",
    });
  });
});

// ---------------------------------------------------------------------------
// Erro de conexão (fetch rejeita)
// ---------------------------------------------------------------------------

describe("erro de conexão", () => {
  it("lança mensagem de inacessibilidade quando fetch rejeita", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
    );

    await expect(listPokemon()).rejects.toThrow("API inacessível");
  });
});
