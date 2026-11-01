# C216 L1 - Sistemas Distribuídos

Repositório do laboratório de Sistemas Distribuídos (C216) - INATEL, 2026.2.

Aluno: Alexandre Tommasi Alves

## Pré-requisitos

- Docker e Docker Compose
- GNU Make
- Node.js 22+ (apenas para o frontend)

## Como executar o ambiente

1. Copie o arquivo de variáveis de ambiente:

```bash
cp .env.example .env
```

2. Construa as imagens e suba os serviços:

```bash
make build
make up
```

3. Verifique o estado dos serviços:

```bash
make ps
```

A API fica disponível em `http://localhost:8000`, com documentação interativa em `http://localhost:8000/docs`.

Para encerrar o ambiente: `make down`.

## Serviços

| Serviço   | Porta | Descrição                            |
|-----------|-------|--------------------------------------|
| `backend` | 8000  | API FastAPI executada em container   |
| `db`      | 5432  | PostgreSQL 16 com volume persistente |

O backend se comunica com o banco pelo nome do serviço (`db`) na rede interna criada pelo Compose.

## Arquitetura do backend

O backend segue uma arquitetura em camadas dentro de `backend/src/backend/`:

| Camada | Módulo | Responsabilidade |
|--------|--------|-----------------|
| Inicialização | `main.py` | Cria o `FastAPI` e registra os routers; não contém nenhum endpoint |
| Rotas | `api/routes/` | Define os endpoints com `APIRouter`, valida parâmetros de entrada e delega para a camada de serviço |
| Schemas | `schemas/` | Modelos Pydantic que descrevem o formato de entrada e saída da API (`PokemonBase`, `PokemonCreate`, `PokemonUpdate`, `PokemonResponse`) |
| Serviços | `services/` | Lógica de negócio pura, sem dependência de HTTP; manipula o estado em memória e pode ser testada sem subir a aplicação |

### Endpoints disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/pokemon` | Lista todos os pokémons; aceita query param `tipo` para filtrar |
| `GET` | `/pokemon/{numero}` | Retorna um pokémon pelo número |
| `POST` | `/pokemon` | Cria um novo pokémon (409 se o número já existir) |
| `PUT` | `/pokemon/{numero}` | Substitui completamente um pokémon existente |
| `PATCH` | `/pokemon/{numero}` | Atualiza parcialmente um pokémon existente |
| `DELETE` | `/pokemon/{numero}` | Remove um pokémon |
| `GET` | `/health` | Verifica se o serviço está no ar |
| `GET` | `/info` | Retorna metadados da disciplina |

A documentação interativa gerada pelo FastAPI fica disponível em `http://localhost:8000/docs`.

## Desenvolvimento local sem Docker

```bash
make install
make run
```

## Testes

Os testes estão separados em duas camadas dentro de `backend/tests/`:

| Camada | Diretório | O que testa |
|--------|-----------|-------------|
| Unitários | `tests/unit/` | Funções de `services/` diretamente, sem HTTP |
| Integração | `tests/integration/` | Endpoints via `TestClient` do FastAPI |

Com as dependências instaladas (`make install`), rode os grupos individualmente ou a suíte completa:

```bash
make test-unit   # apenas testes unitários
make test-int    # apenas testes de integração
make test        # suíte completa
```

Para rodar com relatório de cobertura:

```bash
make test-cov
```

O CI (`.github/workflows/ci-backend.yml`) executa os dois grupos como steps distintos em `push` e `pull request` que alteram `backend/`.

## Frontend

Interface do gerenciador de pokémon em `frontend/`, escrita em JavaScript puro (sem TypeScript).

> Nesta etapa o frontend **não se comunica com o backend**: os pokémon ficam apenas no estado do React (`useState`) e são perdidos ao recarregar a página. A integração com `POST /pokemon` fica para a Prática 7.

### Stack

| Ferramenta | Uso |
|------------|-----|
| React 19 | Componentes da interface |
| Vite | Servidor de desenvolvimento e build |
| Tailwind CSS 4 | Estilização, via plugin `@tailwindcss/vite` |
| Biome | Lint e formatação |
| Vitest + Testing Library | Testes unitários e de integração |
| Playwright | Testes end-to-end no Chromium |

### Estrutura de pastas

```text
frontend/
├── src/
│   ├── components/
│   │   ├── PokemonForm.jsx   # Formulário com validação e chips de tipo
│   │   └── PokemonList.jsx   # Listagem em cards e estado vazio
│   ├── App.jsx               # Estado dos pokémon e estrutura da página
│   ├── main.jsx              # Ponto de entrada
│   ├── validation.js         # validatePokemon (função pura) e constantes
│   ├── typeStyles.js         # Cores de cada tipo de pokémon
│   └── index.css             # Importa o Tailwind
├── tests/
│   ├── unit/                 # validation, PokemonForm e PokemonList
│   ├── integration/          # App completo com user-event
│   ├── e2e/                  # Playwright
│   └── setup.js              # jest-dom e cleanup
├── playwright.config.js
├── vite.config.js
└── biome.json
```

### Desenvolvimento

Requer Node.js 22 ou superior. Da raiz do repositório:

```bash
make frontend-install   # npm ci
make frontend-dev       # http://localhost:5173
```

### Testes

| Nível | Diretório | Comando |
|-------|-----------|---------|
| Unitários | `tests/unit/` | `make frontend-test` |
| Integração | `tests/integration/` | `make frontend-test` |
| E2E | `tests/e2e/` | `make frontend-test-e2e` |

O Vitest roda unitários e integração juntos. Na primeira execução dos testes E2E, instale o navegador com `npm --prefix frontend exec playwright install chromium`; o Playwright sobe o servidor do Vite sozinho.

Qualidade de código e build:

```bash
make frontend-check   # lint e formatação com Biome
make frontend-build   # build de produção
make check-all        # backend e frontend completos
```

O CI (`.github/workflows/ci-frontend.yml`) roda lint, formatação, testes, build e E2E quando há mudanças em `frontend/`.

## Comandos disponíveis

Execute `make help` na raiz para a lista completa.