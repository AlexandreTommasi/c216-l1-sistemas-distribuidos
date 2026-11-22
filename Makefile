POETRY  := poetry -C backend
RUN     := $(POETRY) run
APP     := overload.main:app
HOST    := 127.0.0.1
PORT    := 8000
DB_PORT ?= 5432

_PG_USER := $(or $(POSTGRES_USER),postgres)
_PG_PASS := $(or $(POSTGRES_PASSWORD),postgres)
_TEST_URL  = postgresql+psycopg://$(_PG_USER):$(_PG_PASS)@127.0.0.1:$(DB_PORT)/overload_test

.PHONY: help install update run lint format check clean \
        front-install front-dev front-build front-lint front-format front-test \
        build up down down-volumes logs ps migrate test-int

help:
	@echo ------------------------------------------
	@echo Overload - comandos disponiveis
	@echo ------------------------------------------
	@echo [Dependencias]
	@echo   install   Instala as dependencias do backend
	@echo   update    Atualiza dependencias e lock file
	@echo ------------------------------------------
	@echo [Desenvolvimento]
	@echo   run       Sobe o uvicorn local com --reload
	@echo ------------------------------------------
	@echo [Qualidade]
	@echo   lint      Verifica o codigo com ruff check
	@echo   format    Formata o codigo com ruff format
	@echo   check     Formata e depois verifica o codigo
	@echo ------------------------------------------
	@echo [Frontend]
	@echo   front-install   Instala as dependencias do frontend
	@echo   front-dev       Sobe o servidor de dev do Vite
	@echo   front-build     Gera o bundle de producao em dist/
	@echo   front-lint      Verifica o frontend com biome lint
	@echo   front-format    Formata o frontend com biome format
	@echo   front-test      Executa os testes do frontend uma vez
	@echo ------------------------------------------
	@echo [Docker]
	@echo   build        Constroi as imagens Docker
	@echo   up           Sobe todos os servicos em background
	@echo   down         Para e remove os conteineres, preserva o volume
	@echo   down-volumes Para e remove os conteineres e o volume de dados
	@echo   logs         Acompanha os logs do backend
	@echo   ps           Lista os conteineres e seus estados
	@echo   migrate      Executa as migrations manualmente
	@echo ------------------------------------------
	@echo [Testes de Integracao]
	@echo   test-int  Sobe overload_test e roda os testes de integracao
	@echo ------------------------------------------
	@echo [Limpeza]
	@echo   clean     Remove __pycache__ .pytest_cache e .ruff_cache
	@echo ------------------------------------------

install:
	$(POETRY) install --with dev

update:
	$(POETRY) update

run:
	$(RUN) uvicorn $(APP) --host $(HOST) --port $(PORT) --reload

lint:
	$(RUN) ruff check .

format:
	$(RUN) ruff format .

check: format lint

clean:
	@$(RUN) python -c "import shutil, pathlib; [shutil.rmtree(p, ignore_errors=True) for p in pathlib.Path('.').rglob('__pycache__')]; shutil.rmtree('.pytest_cache', ignore_errors=True); shutil.rmtree('.ruff_cache', ignore_errors=True)"

front-install:
	npm --prefix frontend install

front-dev:
	npm --prefix frontend run dev

front-build:
	npm --prefix frontend run build

front-lint:
	npm --prefix frontend run lint

front-format:
	npm --prefix frontend run format

front-test:
	npm --prefix frontend run test:run

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

down-volumes:
	docker compose down -v

logs:
	docker compose logs -f backend

ps:
	docker compose ps

migrate:
	docker compose run --rm migrate

test-int:
	@echo "→ Criando banco de testes (overload_test) se necessario..."
	@$(RUN) python -c "import sqlalchemy as sa; u='postgresql+psycopg://$(_PG_USER):$(_PG_PASS)@127.0.0.1:$(DB_PORT)/postgres'; e=sa.create_engine(u,isolation_level='AUTOCOMMIT'); c=e.connect(); c.execute(sa.text('CREATE DATABASE overload_test')) if not c.execute(sa.text('SELECT 1 FROM pg_database WHERE datname=:n'),{'n':'overload_test'}).fetchone() else None; c.close(); print('overload_test: pronto')"
	DATABASE_URL=$(_TEST_URL) TEST_DATABASE_URL=$(_TEST_URL) \
		$(RUN) pytest -m integration -v
