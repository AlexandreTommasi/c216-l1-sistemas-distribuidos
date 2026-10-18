# C216 L1 - Sistemas Distribuídos

Repositório do laboratório de Sistemas Distribuídos (C216) - INATEL, 2026.2.

Aluno: Alexandre Tommasi Alves

## Pré-requisitos

- Docker e Docker Compose
- GNU Make
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

O Compose sobe o `db` e espera o healthcheck, executa o serviço one-shot `migrate` (`alembic upgrade head`) e só então inicia o `backend`. Se a migration falhar, o backend não sobe (veja o erro com `docker compose logs migrate`). As migrations rodam a cada `make up`; como o Alembic só aplica as pendentes, repeti-las é seguro. O banco já sobe com os 6 pokémons iniciais, inseridos pela migration de seed.

3. Verifique o estado dos serviços:

```bash
make ps
```

A API fica disponível em `http://localhost:8000`, com documentação interativa em `http://localhost:8000/docs`.

Para encerrar o ambiente: `make down`.

## Serviços

| Serviço   | Porta | Descrição                                                          |
|-----------|-------|--------------------------------------------------------------------|
| `db`      | 5432  | PostgreSQL 16 com volume persistente                               |
| `migrate` | -     | Executa `alembic upgrade head` e encerra; o `backend` depende dele |
| `backend` | 8000  | API FastAPI executada em container                                 |

`migrate` e `backend` usam a mesma imagem. Ambos recebem do Compose a `DATABASE_URL` apontando para o serviço `db` na rede interna; a `DATABASE_URL` do `.env` (com `localhost`) só vale para comandos executados fora do Docker.

## Arquitetura do backend

O backend segue uma arquitetura em camadas dentro de `backend/src/backend/`:

| Camada | Módulo | Responsabilidade |
|--------|--------|-----------------|
| Inicialização | `main.py` | Cria o `FastAPI` e registra os routers; não contém nenhum endpoint |
| Rotas | `api/routes/` | Define os endpoints com `APIRouter`, valida parâmetros de entrada, recebe a sessão via `Depends(get_db)` e delega para a camada de serviço |
| Schemas | `schemas/` | Modelos Pydantic de entrada e saída da API (`PokemonBase`, `PokemonCreate`, `PokemonUpdate`, `PokemonResponse`, este com `from_attributes`) |
| Serviços | `services/` | Regras de negócio (normalização de nomes, conflito de número, etc.); não conhecem HTTP nem SQL, apenas chamam o repositório |
| Repositórios | `repositories/` | Único ponto de acesso aos dados: consultas e escritas com SQLAlchemy |
| Modelos | `models/` | Modelos ORM (tabela `pokemon`: `numero` PK, `nome`, `tipos`); separados dos schemas Pydantic |
| Database | `database/` | `Base` declarativa, `engine`, `SessionLocal` e a dependência `get_db` |
| Core | `core/` | Configuração via Pydantic Settings; lê `DATABASE_URL` do ambiente (ou de `.env`) |

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

Os testes estão separados em duas camadas dentro de `backend/tests/`:

| Camada | Diretório | O que testa |
|--------|-----------|-------------|
| Unitários | `tests/unit/` | Funções de `services/` diretamente, sem HTTP e sem banco (repositório substituído por um fake em memória) |
| Integração | `tests/integration/` | Endpoints via `TestClient` contra um **PostgreSQL real**, com a dependência `get_db` sobrescrita |

Os testes de integração usam um **PostgreSQL real**, não mocks nem SQLite: precisam de um banco com as migrations aplicadas (`make db-upgrade`) e de `DATABASE_URL` apontando para ele. Para usar um banco dedicado sem alterar a `DATABASE_URL` do ambiente, defina `TEST_DATABASE_URL`; quando presente, ela tem prioridade nos testes de integração. Os testes unitários não precisam de banco nem de variável alguma.

Um dos testes de integração comprova a persistência: cria um pokémon via `POST`, confirma a linha com um `SELECT` direto na tabela e lê o mesmo dado de volta pela API em outra sessão.

**Isolamento:** cada teste roda dentro de uma transação externa que é revertida (`rollback`) ao final; os `commit`s dos repositórios viram `SAVEPOINT`s. Assim os testes não deixam dados no banco e não dependem de ordem, sem o custo de recriar o schema a cada teste. Antes de cada teste a tabela é esvaziada e populada com os 6 pokémons iniciais, tudo dentro da transação revertida, então o conteúdo prévio do banco (inclusive o seed) é preservado.

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

O CI (`.github/workflows/ci-backend.yml`) sobe um service container `postgres:16` com healthcheck (banco `c216_test`, configurado via `DATABASE_URL`), aplica as migrations com `alembic upgrade head` e executa os testes unitários e de integração como steps distintos em todo `push` e `pull request`.

## Comandos disponíveis

Execute `make help` na raiz para a lista completa (inclui os targets `db-*` de migrations).