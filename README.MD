# C216 L1 - Sistemas Distribuídos

Repositório do laboratório de Sistemas Distribuídos (C216) - INATEL, 2026.2.

Aluno: Alexandre Tommasi Alves

## Pré-requisitos

- Docker e Docker Compose
- GNU Make
- Node.js 22+ (apenas para o frontend)
- Para desenvolvimento local sem Docker: Python 3.14 e Poetry

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

O Compose sobe o `db` e espera o healthcheck, executa o serviço one-shot `migrate` (`alembic upgrade head`) e só então inicia o `backend`. Assim que o backend passa no healthcheck, o `frontend` é iniciado. Se a migration falhar, o backend não sobe (veja o erro com `docker compose logs migrate`). As migrations rodam a cada `make up`; como o Alembic só aplica as pendentes, repeti-las é seguro. O banco já sobe com os 6 pokémons iniciais, inseridos pela migration de seed.

3. Verifique o estado dos serviços:

```bash
make ps
```

A API fica disponível em `http://localhost:8000`, com documentação interativa em `http://localhost:8000/docs`. O frontend fica disponível em `http://localhost:5173`.

Para encerrar o ambiente: `make down`.

## Serviços

| Serviço    | Porta | Descrição                                                                  |
|------------|-------|----------------------------------------------------------------------------|
| `db`       | 5432  | PostgreSQL 16 com volume persistente                                       |
| `migrate`  | -     | Executa `alembic upgrade head` e encerra; o `backend` depende dele         |
| `backend`  | 8000  | API FastAPI executada em container                                         |
| `frontend` | 5173  | Interface React servida pelo Vite em modo de desenvolvimento               |

`migrate` e `backend` usam a mesma imagem. Ambos recebem do Compose a `DATABASE_URL` apontando para o serviço `db` na rede interna; a `DATABASE_URL` do `.env` (com `localhost`) só vale para comandos executados fora do Docker. O `frontend` recebe `VITE_API_URL=http://localhost:${BACKEND_PORT:-8000}`; como a requisição parte do browser, o endereço precisa ser acessível pelo host, não pelo nome interno do container (veja a seção Integração full-stack).

## Integração full-stack

### Fluxo de uma requisição

O cadastro de um pokémon ilustra o caminho completo, do clique até o banco e de volta:

```
Browser (clique em "Adicionar")
  → PokemonForm.jsx   — valida os campos localmente, chama addPokemon
    → App.jsx         — delega para services/pokemon.js
      → services/pokemon.js  — fetch POST /pokemon com body JSON
        → FastAPI (rota POST /pokemon)  — valida schema Pydantic
          → PokemonService  — normalização de nomes, verifica conflito de número
            → PokemonRepository  — INSERT via SQLAlchemy
              → PostgreSQL  — grava linha na tabela pokemon
            ← linha gravada
          ← PokemonResponse
        ← 201 Created { ... }
      ← objeto pokémon
    ← estado React atualizado com o novo pokémon
  ← lista re-renderizada
```

Na listagem inicial (`GET /pokemon`), o `useEffect` em `App.jsx` chama `listPokemon()` ao montar o componente; `services/pokemon.js` faz `fetch GET /pokemon` e os dados retornados substituem o estado `pokemons`.

### CORS

O browser bloqueia por padrão requisições JavaScript para uma origem diferente da página (política de mesma origem). Como o frontend (`http://localhost:5173`) e a API (`http://localhost:8000`) têm portas diferentes, toda requisição é cross-origin: o browser envia um header `Origin` e só prossegue se a API responder com `access-control-allow-origin` correspondente.

O backend usa `CORSMiddleware` do FastAPI, configurado pela variável de ambiente `CORS_ORIGINS` (lista de origens separada por vírgulas). O padrão no Compose é `http://localhost:5173,http://127.0.0.1:5173`. Para adicionar uma origem em tempo de execução:

```bash
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://outra-origem" make up
```

Ou defina `CORS_ORIGINS` no `.env` antes de `make up`.

### localhost vs nome de serviço

Dentro de um container o Docker resolve nomes de serviço pela rede interna do Compose (`db`, `backend`, etc.). Fora do container — especialmente no browser do usuário — esses nomes não existem.

| Variável | Valor no Compose | Resolvido por |
|----------|-----------------|---------------|
| `DATABASE_URL` | `postgresql+psycopg://...@db:5432/c216` | Docker DNS (container → container) |
| `VITE_API_URL` | `http://localhost:${BACKEND_PORT:-8000}` | Sistema operacional do host (browser → porta exposta) |

O Vite substitui `import.meta.env.VITE_API_URL` em tempo de transformação do módulo, antes do bundle chegar ao browser. Por isso o valor precisa ser o endereço que o browser consegue alcançar — `localhost` —, e não o nome interno do container.

## Arquitetura do backend

O backend segue uma arquitetura em camadas dentro de `backend/src/backend/`:

| Camada | Módulo | Responsabilidade |
|--------|--------|-----------------|
| Inicialização | `main.py` | Cria o `FastAPI`, registra o `CORSMiddleware` e os routers; não contém nenhum endpoint |
| Rotas | `api/routes/` | Define os endpoints com `APIRouter`, valida parâmetros de entrada, recebe a sessão via `Depends(get_db)` e delega para a camada de serviço |
| Schemas | `schemas/` | Modelos Pydantic de entrada e saída da API (`PokemonBase`, `PokemonCreate`, `PokemonUpdate`, `PokemonResponse`, este com `from_attributes`) |
| Serviços | `services/` | Regras de negócio (normalização de nomes, conflito de número, etc.); não conhecem HTTP nem SQL, apenas chamam o repositório |
| Repositórios | `repositories/` | Único ponto de acesso aos dados: consultas e escritas com SQLAlchemy |
| Modelos | `models/` | Modelos ORM (tabela `pokemon`: `numero` PK, `nome`, `tipos`); separados dos schemas Pydantic |
| Database | `database/` | `Base` declarativa, `engine`, `SessionLocal` e a dependência `get_db` |
| Core | `core/` | Configuração via Pydantic Settings; lê `DATABASE_URL` e `CORS_ORIGINS` do ambiente (ou de `.env`) |

Fluxo de uma requisição: **Route → Service → Repository → SQLAlchemy → PostgreSQL**.

A coluna `tipos` é um `ARRAY(VARCHAR)` nativo do PostgreSQL: a lista é sempre lida e gravada junto do pokémon, preserva a ordem e o filtro por tipo é simples (`tipo = ANY(tipos)`). Uma tabela relacionada só compensaria se tipos tivessem atributos próprios.

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

## Migrations (Alembic)

O schema do banco é versionado com Alembic (`backend/alembic/`). A URL vem de `core/config.py` (`DATABASE_URL`) e o `env.py` conhece o metadata dos modelos, então o autogenerate funciona. Hoje há duas migrations: a que cria a tabela `pokemon` e uma de seed (`seed pokemon iniciais`) que insere os 6 pokémons iniciais.

Os targets abaixo rodam na sua máquina via Poetry (não dentro do container), então precisam de `DATABASE_URL` apontando para um banco acessível, como o `db` do Compose exposto em `localhost:5432`:

```bash
make db-upgrade                       # aplica as migrations pendentes
make db-downgrade                     # desfaz a última migration (a de seed remove só os 6 registros que inseriu)
make db-migration msg="descricao"     # gera migration a partir dos modelos (revise o arquivo!)
make db-current                       # revisão aplicada no banco
make db-history                       # histórico de migrations
```

Ao alterar um modelo em `models/`, rode `make db-migration msg="..."`, revise o arquivo criado em `backend/alembic/versions/` e commite-o junto da mudança.

## Inspecionar os dados via psql

Com o ambiente no ar:

```bash
make db-shell
```

Isso abre o `psql` dentro do container `db`. Também é possível conectar do host: `psql postgresql://c216:c216@localhost:5432/c216`.

```sql
\dt                                  -- lista as tabelas
\d pokemon                           -- estrutura da tabela (tipos é character varying(30)[])
SELECT * FROM pokemon ORDER BY numero;
SELECT * FROM alembic_version;        -- revisão aplicada
```

Os 6 pokémons iniciais vêm da migration de seed; novos registros podem ser criados pela API (`POST /pokemon`) ou em `http://localhost:8000/docs` e aparecem imediatamente no `psql`.

## Desenvolvimento local sem Docker

Requer um PostgreSQL acessível (por exemplo, `docker compose up -d db`) e `DATABASE_URL` definida no `.env` da raiz (veja `.env.example`) ou no ambiente. A aplicação lê `.env` tanto da raiz quanto de `backend/`:

```bash
make install
make db-upgrade
make run
```

## Testes

O projeto tem três níveis de teste, cobrindo desde funções puras até a stack completa rodando em containers.

| Nível | Localização | O que verifica | Depende de |
|-------|-------------|----------------|------------|
| Unitários (backend) | `backend/tests/unit/` | Funções de `services/` isoladas; repositório substituído por um fake em memória | Apenas dependências Python instaladas |
| Integração (backend) | `backend/tests/integration/` | Endpoints via `TestClient` contra PostgreSQL real; persistência e headers CORS | PostgreSQL acessível + migrations aplicadas |
| Unitários e integração (frontend) | `frontend/tests/unit/` e `frontend/tests/integration/` | Componentes React e fluxo completo do formulário; HTTP mockado com `vi.stubGlobal` | Node.js (sem banco, sem backend) |
| E2E | `frontend/tests/e2e/` | Fluxo no browser contra a stack real (db + backend + frontend em containers): cadastro, persistência após reload, erro 409 da API | Docker Compose disponível |

### Backend

Os testes de integração usam um **PostgreSQL real**, não mocks nem SQLite: precisam de um banco com as migrations aplicadas (`make db-upgrade`) e de `DATABASE_URL` apontando para ele. Para usar um banco dedicado sem alterar a `DATABASE_URL` do ambiente, defina `TEST_DATABASE_URL`; quando presente, ela tem prioridade nos testes de integração. Os testes unitários não precisam de banco nem de variável alguma.

**Isolamento:** cada teste roda dentro de uma transação externa que é revertida (`rollback`) ao final; os `commit`s dos repositórios viram `SAVEPOINT`s. Assim os testes não deixam dados no banco e não dependem de ordem, sem o custo de recriar o schema a cada teste.

```bash
make test-unit   # apenas testes unitários
make test-int    # apenas testes de integração
make test        # suíte completa
make test-cov    # suíte completa com relatório de cobertura
```

O CI (`.github/workflows/ci-backend.yml`) sobe um service container `postgres:16` com healthcheck, aplica as migrations e executa unitários e integração como steps distintos.

### Frontend

Os testes de unitários e integração usam `vi.stubGlobal('fetch', ...)` para simular respostas da API sem depender de um backend rodando. Os testes E2E com Playwright apontam para o servidor Vite local por padrão; quando `E2E_BASE_URL` está definida, apontam para a URL informada (usada pelo `make e2e`).

```bash
make frontend-test        # unitários e integração (Vitest)
make frontend-test-e2e    # E2E contra o servidor Vite local (inicia automaticamente)
make e2e                  # sobe stack isolada em containers, roda Playwright e derruba tudo
```

O `make e2e` usa `-p lab-e2e` para isolar o projeto Compose (volumes, rede e nomes de container não colidem com a stack de desenvolvimento), expõe o backend na porta 8001 e o frontend na 5174, e executa `down -v` ao final independente do resultado.

O CI (`.github/workflows/ci-frontend.yml`) sobe um service container `postgres:16`, executa lint, testes unitários e de integração, build, e então inicia o backend com `uvicorn` em background para rodar os testes E2E com Playwright.

## Frontend

Interface do gerenciador de pokémon em `frontend/`, escrita em JavaScript puro (sem TypeScript). O frontend se comunica com o backend via `fetch`: busca a lista de pokémons ao iniciar (`GET /pokemon`) e envia o formulário de cadastro para a API (`POST /pokemon`). Os dados ficam persistidos no banco e sobrevivem ao reload da página.

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
│   │   ├── PokemonForm.jsx   # Formulário com validação, estado de salvamento e erro da API
│   │   └── PokemonList.jsx   # Listagem em cards e estado vazio
│   ├── services/
│   │   └── pokemon.js        # Funções de acesso à API (listPokemon, createPokemon, etc.)
│   ├── App.jsx               # Estado dos pokémon, carregamento inicial e estrutura da página
│   ├── main.jsx              # Ponto de entrada
│   ├── validation.js         # validatePokemon (função pura) e constantes
│   ├── typeStyles.js         # Cores de cada tipo de pokémon
│   └── index.css             # Importa o Tailwind
├── tests/
│   ├── unit/                 # validation, PokemonForm, PokemonList e services/pokemon
│   ├── integration/          # App completo com user-event e fetch mockado
│   ├── e2e/                  # Playwright contra a stack real
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

O frontend lê `VITE_API_URL` do ambiente (ou de `frontend/.env`); sem ela, usa `http://localhost:8000` como padrão. Veja `frontend/.env.example`.

### Testes

| Nível | Diretório | Comando | Depende de |
|-------|-----------|---------|------------|
| Unitários | `tests/unit/` | `make frontend-test` | Node.js |
| Integração | `tests/integration/` | `make frontend-test` | Node.js |
| E2E (servidor local) | `tests/e2e/` | `make frontend-test-e2e` | Backend rodando em `localhost:8000` |
| E2E (stack isolada) | `tests/e2e/` | `make e2e` | Docker Compose |

O Vitest roda unitários e integração juntos com `make frontend-test`. Na primeira execução dos testes E2E, instale o navegador com `npm --prefix frontend exec playwright install chromium`; o Playwright sobe o servidor do Vite sozinho quando `E2E_BASE_URL` não está definida.

Qualidade de código e build:

```bash
make frontend-check   # lint e formatação com Biome
make frontend-build   # build de produção
make check-all        # backend e frontend completos
```

O CI (`.github/workflows/ci-frontend.yml`) roda lint, formatação, testes, build e E2E quando há mudanças em `frontend/` ou `backend/`.

## Comandos disponíveis

Execute `make help` na raiz para a lista completa (inclui os targets `db-*` de migrations e `e2e` para a stack isolada).
