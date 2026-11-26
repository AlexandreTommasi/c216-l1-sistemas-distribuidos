import os

# Garante que a importação do app não falhe quando DATABASE_URL não está
# configurada no ambiente local. Os testes de integração sobrescrevem get_db
# e nunca usam este engine de fato.
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://x:x@localhost/x")
