.PHONY: help install update run lint format check clean build up down restart logs ps shell db-shell

POETRY := poetry -C backend
RUN := $(POETRY) run
COMPOSE := docker compose
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
	@echo   make clean     Remove caches e arquivos temporarios
	@echo.
	@echo   Ambiente containerizado
	@echo   make build     Constroi as imagens dos servicos
	@echo   make up        Sobe o ambiente em background
	@echo   make down      Encerra os servicos
	@echo   make restart   Reinicia o servico de backend
	@echo   make logs      Acompanha os logs do backend
	@echo   make ps        Lista o estado dos servicos
	@echo   make shell     Abre um shell no container do backend
	@echo   make db-shell  Abre o psql no container do banco
	@echo.

install:
	$(POETRY) install

update:
	$(POETRY) update

run:
	cd backend && poetry run uvicorn $(APP) --host $(HOST) --port $(PORT) --reload

lint:
	$(RUN) ruff check backend

format:
	$(RUN) ruff format backend

check: format lint

clean:
	-$(RUN) python -c "import pathlib, shutil; [shutil.rmtree(p, ignore_errors=True) for p in pathlib.Path('.').rglob('__pycache__')]"
	-$(RUN) python -c "import pathlib, shutil; [shutil.rmtree(p, ignore_errors=True) for p in ['backend/.pytest_cache', 'backend/.ruff_cache'] if pathlib.Path(p).exists()]"

build:
	$(COMPOSE) build

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