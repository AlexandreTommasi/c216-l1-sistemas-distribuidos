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

## Desenvolvimento local sem Docker

```bash
make install
make run
```

## Testes

Com as dependências instaladas (`make install`), rode os testes localmente:

```bash
make test
```

Para rodar com relatório de cobertura:

```bash
make test-cov
```

O CI (`.github/workflows/ci-backend.yml`) executa os testes automaticamente em todo `push` e `pull request`.

## Comandos disponíveis

Execute `make help` na raiz para a lista completa.