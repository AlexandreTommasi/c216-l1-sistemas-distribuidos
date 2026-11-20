POETRY := poetry -C backend
RUN    := $(POETRY) run
APP    := overload.main:app
HOST   := 127.0.0.1
PORT   := 8000

.PHONY: help install update run lint format check clean

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
