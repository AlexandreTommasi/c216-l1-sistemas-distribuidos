FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false

RUN pip install --no-cache-dir poetry

WORKDIR /app

# Dependencias em camada separada — so refaz quando o lock muda
COPY pyproject.toml poetry.lock ./
RUN poetry install --without dev --no-root

# Codigo-fonte e migrations
COPY src ./src
COPY alembic ./alembic
COPY alembic.ini ./

ENV PYTHONPATH=/app/src

CMD ["uvicorn", "overload.main:app", "--host", "0.0.0.0", "--port", "8000"]
