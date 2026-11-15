.PHONY: help install update run lint format check test test-unit test-int test-cov clean build rebuild up down restart logs ps shell db-shell db-upgrade db-downgrade db-migration db-current db-history frontend-install frontend-dev frontend-lint frontend-format frontend-check frontend-test frontend-test-e2e frontend-build frontend-logs frontend-shell check-all e2e

POETRY := poetry -C backend
RUN := $(POETRY) run
COMPOSE := docker compose
NPM := npm --prefix frontend
APP := backend.main:app
HOST := 127.0.0.1
PORT := 8000

help:
	@echo.
	@echo   C216 L1 - Comandos do projeto
	@echo.
	@echo   Desenvolvimento local
	@echo   make install   Instala as dependencias do backend
	@echo   make update    Atualiza as dependencias e o lock
	@echo   make run       Sobe o servidor local em $(HOST):$(PORT)
	@echo   make lint      Analisa o codigo com Ruff
	@echo   make format    Formata o codigo com Ruff
	@echo   make check     Formata e valida o codigo
	@echo   make test      Roda a suite completa de testes
	@echo   make test-unit Roda apenas os testes unitarios
	@echo   make test-int  Roda apenas os testes de integracao
	@echo   make test-cov  Roda os testes com relatorio de cobertura
	@echo   make clean     Remove caches e arquivos temporarios
	@echo.
	@echo   Ambiente containerizado
	@echo   make build          Constroi as imagens dos servicos
	@echo   make rebuild        Reconstroi as imagens e sobe a stack
	@echo   make up             Sobe o ambiente em background
	@echo   make down           Encerra os servicos
	@echo   make restart        Reinicia o servico de backend
	@echo   make logs           Acompanha os logs do backend
	@echo   make ps             Lista o estado dos servicos
	@echo   make shell          Abre um shell no container do backend
	@echo   make db-shell       Abre o psql no container do banco
	@echo   make frontend-logs  Acompanha os logs do frontend
	@echo   make frontend-shell Abre um shell no container do frontend
	@echo   make e2e            Sobe stack isolada, roda Playwright e derruba tudo
	@echo.
	@echo   Migrations (Alembic)
	@echo   make db-upgrade               Aplica as migrations pendentes
	@echo   make db-downgrade             Desfaz a ultima migration
	@echo   make db-migration msg="..."   Gera uma migration a partir dos modelos
	@echo   make db-current               Mostra a revisao aplicada no banco
	@echo   make db-history               Lista o historico de migrations
	@echo.
	@echo   Frontend
	@echo   make frontend-install   Instala as dependencias do frontend (npm ci)
	@echo   make frontend-dev       Sobe o servidor de desenvolvimento do frontend
	@echo   make frontend-lint      Analisa o codigo do frontend com Biome
	@echo   make frontend-format    Formata o codigo do frontend com Biome
	@echo   make frontend-check     Valida lint e formatacao do frontend
	@echo   make frontend-test      Roda os testes unitarios e de integracao do frontend
	@echo   make frontend-test-e2e  Roda os testes e2e do frontend com Playwright
	@echo   make frontend-build     Gera o build de producao do frontend
	@echo   make check-all          Roda todas as verificacoes de backend e frontend
	@echo.

install:
	$(POETRY) install

update:
	$(POETRY) update

run:
	cd backend && poetry run uvicorn $(APP) --host $(HOST) --port $(PORT) --reload

lint:
	$(RUN) ruff check .

format:
	$(RUN) ruff format .

check: format lint

test:
	$(RUN) pytest tests

test-unit:
	$(RUN) pytest tests -m unit

test-int:
	$(RUN) pytest tests -m integration

test-cov:
	$(RUN) pytest tests --cov=backend --cov-report=term-missing

clean:
	-$(RUN) python -c "import pathlib, shutil; [shutil.rmtree(p, ignore_errors=True) for p in pathlib.Path('.').rglob('__pycache__')]"
	-$(RUN) python -c "import pathlib, shutil; [shutil.rmtree(p, ignore_errors=True) for p in ['backend/.pytest_cache', 'backend/.ruff_cache'] if pathlib.Path(p).exists()]"

build:
	$(COMPOSE) build

rebuild:
	$(COMPOSE) up -d --build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart backend

logs:
	$(COMPOSE) logs -f backend

ps:
	$(COMPOSE) ps

shell:
	$(COMPOSE) exec backend sh

db-shell:
	$(COMPOSE) exec db psql -U c216 -d c216

db-upgrade:
	$(RUN) alembic upgrade head

db-downgrade:
	$(RUN) alembic downgrade -1

db-migration:
	$(RUN) alembic revision --autogenerate -m "$(msg)"

db-current:
	$(RUN) alembic current

db-history:
	$(RUN) alembic history --verbose

frontend-install:
	$(NPM) ci

frontend-dev:
	$(NPM) run dev

frontend-lint:
	$(NPM) run lint

frontend-format:
	$(NPM) run format

frontend-check:
	$(NPM) run check

frontend-test:
	$(NPM) run test

frontend-test-e2e:
	$(NPM) run test:e2e

frontend-build:
	$(NPM) run build

frontend-logs:
	$(COMPOSE) logs -f frontend

frontend-shell:
	$(COMPOSE) exec frontend sh

# Stack isolada para E2E: projeto proprio, portas diferentes, volume proprio.
# Sobe tudo, roda o Playwright e derruba com down -v independente do resultado.
e2e:
	BACKEND_PORT=8001 FRONTEND_PORT=5174 \
	    CORS_ORIGINS="http://localhost:5174,http://127.0.0.1:5174" \
	    $(COMPOSE) -p lab-e2e up --build --wait; \
	  E2E_BASE_URL=http://localhost:5174 $(NPM) run test:e2e; ec=$$?; \
	  BACKEND_PORT=8001 FRONTEND_PORT=5174 \
	    $(COMPOSE) -p lab-e2e down -v; \
	  exit $$ec

check-all: check test frontend-check frontend-test frontend-build frontend-test-e2e
