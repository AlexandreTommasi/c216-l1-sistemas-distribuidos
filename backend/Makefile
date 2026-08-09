.PHONY: help install update run lint format check clean

POETRY := poetry
RUN := $(POETRY) run
APP := backend.main:app
HOST := 127.0.0.1
PORT := 8000

help:
	@echo.
	@echo   C216 L1 - Comandos do projeto
	@echo.
	@echo   make install   Instala as dependencias do projeto
	@echo   make update    Atualiza as dependencias e o lock
	@echo   make run       Sobe o servidor em $(HOST):$(PORT)
	@echo   make lint      Analisa o codigo com Ruff
	@echo   make format    Formata o codigo com Ruff
	@echo   make check     Executa lint e format em sequencia
	@echo   make clean     Remove caches e arquivos temporarios
	@echo.

install:
	$(POETRY) install

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
	-$(RUN) python -c "import pathlib, shutil; [shutil.rmtree(p, ignore_errors=True) for p in pathlib.Path('.').rglob('__pycache__')]"
	-$(RUN) python -c "import pathlib, shutil; [shutil.rmtree(p, ignore_errors=True) for p in ['.pytest_cache', '.ruff_cache'] if pathlib.Path(p).exists()]"