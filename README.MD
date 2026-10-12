# C216 L1 - Sistemas Distribuídos

Repositório do laboratório de Sistemas Distribuídos (C216) - INATEL, 2026.2.

Aluno: Alexandre Tommasi Alves

## Pré-requisitos

- Docker e Docker Compose
- GNU Make

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

O CI (`.github/workflows/ci-backend.yml`) executa os dois grupos como steps distintos em todo `push` e `pull request`.

## Comandos disponíveis

Execute `make help` na raiz para a lista completa.