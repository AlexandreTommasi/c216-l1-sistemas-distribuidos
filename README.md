# Overload

Overload é uma aplicação para registro de séries de treino de musculação. Para cada exercício realizado em uma sessão, o sistema compara automaticamente a carga com a última vez que aquele exercício foi feito, calculando a variação em quilogramas e repetições.

O problema que a ferramenta resolve é objetivo: quem treina com sobrecarga progressiva precisa saber o que fez na sessão anterior para decidir se aumenta a carga. Caderninho se perde, planilha não está disponível na academia e aplicativos genéricos de diário não mostram a comparação de forma imediata. O Overload registra a série e responde na hora se foi acima ou abaixo da última vez.

---

## Funcionalidades

- Registro de sessões de treino, com treino e data
- Registro de séries na própria tela da sessão: carga, repetições e tipo (válida, aquecimento, preparatória). O formulário continua aberto e preenchido entre uma série e outra, e cada exercício tem um atalho "+ Série"
- Sugestão dos exercícios da última sessão do mesmo treino, com a carga usada
- Comparação de cada exercício com a última vez em que foi feito: variação de carga e status (evoluiu, manteve, regrediu, primeira vez)
- Recorde pessoal por exercício
- Histórico paginado e painel com último treino, treinos na semana, sequência de semanas, média semanal e mapa de consistência
- Tela de evolução por exercício, com gráfico da carga máxima por sessão
- CRUD de exercícios, com filtro por grupo muscular, e CRUD de treinos
- Criação de exercício sem sair da sessão

## Tecnologias

| Parte | Tecnologias |
|-------|-------------|
| Backend | Python 3.14, FastAPI, Pydantic, SQLAlchemy 2, Alembic, Poetry, Ruff, Pytest |
| Banco | PostgreSQL 16 |
| Frontend | React, Vite, Tailwind CSS v4, React Router, Biome, Vitest, Testing Library, Playwright |
| Infraestrutura | Docker, Docker Compose, nginx, GitHub Actions, Make |

---

## Como rodar

### Com Docker (caminho principal)

### Pré-requisitos

- Docker com Compose v2
- Make
- Para rodar sem Docker: Python 3.14 com Poetry, e Node 22


```bash
cp .env.example .env
make up
```

O Compose sobe quatro serviços em ordem:

| Serviço    | O que faz                                                        | Endereço padrão          |
|------------|------------------------------------------------------------------|--------------------------|
| `db`       | PostgreSQL 16                                                    | `localhost:5432`         |
| `migrate`  | Roda `alembic upgrade head` e encerra                           | —                        |
| `backend`  | API FastAPI servida pelo Uvicorn                                 | `http://localhost:8000`  |
| `frontend` | Bundle React servido pelo nginx                                  | `http://localhost:5173`  |

O banco já vem populado com histórico de dez semanas de treino, aplicado por uma migration de seed (`f1e2d3c4b5a6`); uma terceira (`b3d5f7a9c1e2`) corrige a acentuação dos nomes desses exercícios. A tela não fica vazia na primeira execução — isso é intencional para facilitar a avaliação.

Outros comandos úteis:

```bash
make ps            # lista contêineres e estados
make logs          # acompanha os logs do backend em tempo real
make down          # para os contêineres, preserva o volume de dados
make down-volumes  # para e apaga tudo, incluindo o volume do banco
```

### Sem Docker (desenvolvimento local)

Backend (requer Python 3.14 e Poetry):

```bash
make install   # instala dependências
make run       # sobe uvicorn em http://127.0.0.1:8000 com --reload
```

Frontend (requer Node 22):

```bash
make front-install   # npm install
make front-dev       # vite dev em http://localhost:5173
```

Para o backend funcionar localmente, é necessário ter um PostgreSQL acessível e configurar `DATABASE_URL` no ambiente. Veja a seção de variáveis abaixo.

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores conforme necessário. Os padrões funcionam para execução local com Docker.

| Variável          | Para que serve                                                             | Exemplo                                      |
|-------------------|----------------------------------------------------------------------------|----------------------------------------------|
| `POSTGRES_USER`   | Usuário do PostgreSQL                                                      | `postgres`                                   |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL                                                      | `postgres`                                   |
| `POSTGRES_DB`     | Nome do banco de dados                                                     | `overload`                                   |
| `DATABASE_URL`    | URL de conexão usada pelo backend. O host `db` é o nome do serviço dentro da rede do Compose — não é acessível fora dele. | `postgresql://postgres:postgres@db:5432/overload` |
| `CORS_ORIGINS`    | Origens permitidas pelo backend, separadas por vírgula. Deve conter o endereço do frontend **visto pelo browser**, não pelo Compose. | `http://localhost:5173`                      |
| `BACKEND_PORT`    | Porta publicada no host para a API                                         | `8000`                                       |
| `FRONTEND_PORT`   | Porta publicada no host para o nginx                                       | `5173`                                       |
| `DB_PORT`         | Porta publicada no host para o PostgreSQL                                  | `5432`                                       |
| `VITE_API_URL`    | URL base da API **embutida no bundle do frontend em tempo de build**. Deve ser o endereço do backend visto pelo browser — não o endereço interno do Compose. Com Docker, o Compose passa `http://localhost:${BACKEND_PORT}` como build arg. | `http://localhost:8000`                      |

A distinção mais comum de confundir: `DATABASE_URL` usa `db` como host porque o backend roda dentro da rede do Compose; `VITE_API_URL` usa `localhost` porque o JavaScript roda no browser do usuário, fora do Compose.

---

## Arquitetura

### Backend

O backend segue uma separação em quatro camadas:

| Camada          | Responsabilidade                                                                 |
|-----------------|---------------------------------------------------------------------------------|
| `routes/`       | Recebe a requisição HTTP, valida com Pydantic, chama o serviço, retorna a resposta. Sem lógica de negócio. |
| `services/`     | Lógica de negócio: orquestra chamadas ao repositório, lança `NaoEncontrado` ou `Conflito` em caso de violação de regra. |
| `repositories/` | Acesso ao banco: consultas SQLAlchemy. Não conhece regras de negócio.           |
| `models/`       | Modelos SQLAlchemy (mapeamento objeto-relacional).                              |

`schemas/` define os contratos Pydantic de entrada e saída. `core/config.py` lê variáveis de ambiente com Pydantic Settings.

```
backend/src/overload/
├── api/
│   ├── deps.py          # injeção de dependências (serviços via Annotated)
│   └── routes/          # um arquivo por recurso
├── services/            # um arquivo por recurso
├── repositories/        # um arquivo por recurso
├── models/              # treino, sessao, exercicio, serie
├── schemas/             # treino, sessao, exercicio, serie, progresso
├── database/            # session factory e base declarativa
└── core/
    └── config.py        # Settings (lê do ambiente)
```

### Frontend

```
frontend/src/
├── pages/               # HistoricoPage, NovaSessaoPage, SessaoPage, ExerciciosPage, ExercicioPage, TreinosPage
├── components/          # ExercicioCard, DeltaBadge, SessaoList, NavBar, ...
├── services/            # clientes fetch para cada recurso da API
├── validation.js        # regras de validação puras (sem framework)
└── App.jsx              # configuração de rotas (react-router-dom)
```

Não há biblioteca de estado global (Redux, Zustand, etc.). O estado de cada página é local — cada página busca seus próprios dados ao montar. Com seis telas e fluxo de dados unidirecional, adicionar uma biblioteca de estado seria complexidade sem benefício.

---

## API

Todos os endpoints são declarados **sem barra final**. O FastAPI redireciona requisições com barra final por padrão (307), o que quebra clientes que não seguem redirecionamentos automaticamente. Declarar sem barra elimina a ambiguidade.

| Método   | Caminho                             | Descrição                                                              |
|----------|-------------------------------------|------------------------------------------------------------------------|
| `GET`    | `/health`                           | Verifica se a API está no ar                                           |
| `GET`    | `/treinos`                          | Lista todos os treinos                                                 |
| `POST`   | `/treinos`                          | Cria um treino                                                         |
| `GET`    | `/treinos/{id}`                     | Retorna um treino pelo id                                              |
| `PATCH`  | `/treinos/{id}`                     | Atualiza o nome de um treino                                           |
| `DELETE` | `/treinos/{id}`                     | Remove um treino                                                       |
| `GET`    | `/treinos/{id}/sugestao`            | Retorna a sugestão de carga/reps para cada exercício, baseada na última sessão com séries válidas |
| `GET`    | `/sessoes`                          | Lista sessões (parâmetros: `limite`, `offset`)                        |
| `POST`   | `/sessoes`                          | Cria uma sessão vinculada a um treino                                  |
| `GET`    | `/sessoes/{id}`                     | Retorna uma sessão com suas séries                                     |
| `PATCH`  | `/sessoes/{id}`                     | Atualiza data ou treino de uma sessão                                  |
| `DELETE` | `/sessoes/{id}`                     | Remove uma sessão                                                      |
| `POST`   | `/sessoes/{sessao_id}/series`       | Registra uma série em uma sessão                                       |
| `PATCH`  | `/series/{id}`                      | Atualiza carga, repetições ou tipo de uma série                        |
| `DELETE` | `/series/{id}`                      | Remove uma série                                                       |
| `GET`    | `/exercicios`                       | Lista exercícios (parâmetro opcional: `grupo`)                        |
| `POST`   | `/exercicios`                       | Cria um exercício                                                      |
| `GET`    | `/exercicios/{id}`                  | Retorna um exercício pelo id                                           |
| `PATCH`  | `/exercicios/{id}`                  | Atualiza um exercício                                                  |
| `DELETE` | `/exercicios/{id}`                  | Remove um exercício                                                    |
| `GET`    | `/sessoes/{id}/comparacao`          | Compara cada exercício da sessão com a sessão anterior do mesmo treino |
| `GET`    | `/exercicios/{id}/historico`        | Retorna o histórico de carga por data para um exercício                |

A documentação interativa está disponível em `http://localhost:8000/docs` quando o backend está no ar.

---

## Testes

### Backend — unitários (41 testes)

```bash
make test-unit
```

Testam a lógica dos serviços de forma isolada, usando repositórios falsos (`tests/unit/fakes.py`). Não tocam o banco. Cobrem: criação e validação de entidades, cálculo de progresso, casos de erro (`NaoEncontrado`, `Conflito`, nomes duplicados). Alguns casos de teste usam `@pytest.mark.parametrize`, por isso o número de testes executados (40) é maior que o número de funções de teste.

Não cobrem: consultas SQL, serialização HTTP, comportamento de migrations.

### Backend — integração (30 testes)

```bash
make test-int
```

O alvo recria o banco `overload_test`, aplica as migrations e roda os testes contra um PostgreSQL real. Cobrem: todas as rotas HTTP via `TestClient`, restrições de unicidade no banco, integridade referencial, paginação.

Não cobrem: comportamento do frontend, lógica que depende de estado de sessão.

### Frontend — unitários e comportamento (29 testes)

```bash
make front-test
```

Vitest com Testing Library e jsdom. Testam componentes renderizados com `fetch` mockado. Cobrem: renderização condicional, fluxo de formulários, exibição do DeltaBadge, validação de carga. Separados em quatro arquivos por página ou componente.

Não cobrem: chamadas HTTP reais, roteamento do nginx, interação entre páginas.

### E2E — Playwright (4 testes)

```bash
# A stack do Compose deve estar no ar antes de rodar:
make up
make e2e
```

Testam o fluxo completo no browser Chromium contra a stack real do Compose, sem qualquer mock. Cobrem: criação de treino → sessão → exercício inline → registro de série → verificação na lista; registro sequencial de três séries com formulário persistente; sugestão da sessão anterior quando a sessão corrente está vazia; acesso direto a rota (`/exercicios`) sem 404.

---

## Integração contínua

### ci-backend.yml

Dispara em push ou pull request quando `backend/**` ou o próprio arquivo muda.

Passos: instala Poetry, lint e format check com Ruff, `alembic upgrade head` contra um Postgres real (service container), `alembic check` para verificar que os modelos não divergiram das migrations, testes unitários, testes de integração.

### ci-frontend.yml

Dispara em push na branch `projeto-final` ou pull request para `main`, quando `frontend/**`, `backend/**`, `compose.yaml` ou o próprio arquivo mudam.

Dois jobs em paralelo:

**unit** — Node 22, `npm ci`, lint (Biome), format check (Biome), `vitest run`, `vite build`.

**e2e** — `npm ci`, instala Chromium via Playwright, copia `.env.example` para `.env`, sobe a stack com `docker compose up -d --build --wait`, verifica que o serviço `migrate` encerrou com código 0, roda os testes Playwright, derruba a stack. Em caso de falha: publica o relatório HTML do Playwright como artefato (retido por 7 dias) e imprime os logs do Compose para diagnóstico.

---

## Banco e migrations

### Criar uma migration nova

```bash
cd backend
poetry run alembic revision --autogenerate -m "descricao da mudanca"
```

Revise o arquivo gerado em `backend/alembic/versions/` antes de aplicar — o `--autogenerate` detecta diferenças nos modelos, mas pode não capturar mudanças em índices ou constraints personalizadas.

### Aplicar migrations

Via Compose (serviço `migrate`):

```bash
make migrate
```

Localmente (banco deve estar acessível):

```bash
cd backend
poetry run alembic upgrade head
```

### Recomeçar do zero

Para apagar todos os dados e reaplicar as migrations do início (incluindo o seed):

```bash
make down-volumes
make up
```

---

## Vídeo

(link a ser adicionado)

---

## Decisões técnicas

**Treino não tem lista de exercícios.**
Exercícios são uma entidade global e independente — qualquer exercício pode aparecer em qualquer sessão. Associar exercícios diretamente ao treino exigiria uma tabela de associação `treino_exercicio` que não adiciona nenhuma restrição real: o usuário pode usar qualquer exercício em qualquer sessão independentemente. A relação entre treino e exercício emerge do histórico de séries.

**A comparação ignora séries de aquecimento e preparatórias.**
Séries têm um campo `tipo` com três valores: `valida`, `aquecimento`, `preparatoria`. O progresso de sobrecarga é medido pelas séries de trabalho efetivo (`valida`). Incluir aquecimento na comparação produziria deltas enganosos, já que a carga de aquecimento cai antes de cada bloco principal.

**A comparação com a última vez é agregada em SQL, por exercício.**
A primeira versão carregava a sessão anterior inteira e somava as séries em Python. Como a coleção vinha com as séries de todos os exercícios daquela sessão, um exercício leve era comparado com a carga máxima de um pesado feito no mesmo dia, e tudo aparecia regredindo. Os testes não pegaram porque usavam sessões de um exercício só; os dados de seed, com cinco exercícios por sessão, expuseram o bug. Agora uma subconsulta encontra a última sessão em que aquele exercício teve série válida, e o `max` e o `sum` rodam filtrados por `exercicio_id`. Há um teste unitário e um de integração com dois exercícios na mesma sessão para impedir a regressão.

**A sugestão usa a sessão mais recente que tenha séries válidas, não a mais recente por data.**
Se o usuário criar uma sessão vazia (data de hoje) e existir uma sessão anterior com séries, a sugestão deve vir da sessão com histórico, não da sessão vazia. A query usa uma subconsulta para filtrar apenas sessões com `Serie.tipo = 'valida'` antes de ordenar por data.

**`CORS_ORIGINS` é uma string separada por vírgula, não uma lista JSON.**
A abordagem óbvia seria tipar o campo como `list[str]` no `Settings`. O problema: pydantic-settings tenta `json.loads()` no valor da variável de ambiente antes de qualquer validação quando o campo é uma lista. Uma string como `http://localhost:5173,http://127.0.0.1:5173` não é JSON válido, então a aplicação levanta `JSONDecodeError` ao iniciar. A solução adotada é tipar `cors_origins` como `str` e expor uma propriedade `cors_origins_list` que faz o `split(",")` explicitamente. O campo tipado como `str` passa pela validação sem conversão automática.

**O nginx precisa de `try_files` para servir o SPA.**
O React usa roteamento do lado do cliente. Sem `try_files $uri /index.html`, uma requisição direta a `/exercicios` procura um arquivo `exercicios` no disco — que não existe — e retorna 404. O `try_files` garante que qualquer rota não encontrada entregue o `index.html`, deixando o React tratar o caminho.

**O serviço `migrate` é separado do `backend` no Compose.**
Executar `alembic upgrade head` no entrypoint do backend misturaria uma tarefa de inicialização única com o processo principal do servidor. Separar em um serviço `restart: "no"` com `condition: service_completed_successfully` torna a dependência explícita no `compose.yaml` e permite inspecionar o código de saída da migration de forma independente no CI.
