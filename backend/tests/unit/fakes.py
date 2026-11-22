from decimal import Decimal
from types import SimpleNamespace


class FakeExercicioRepository:
    def __init__(self):
        self._store: dict = {}
        self._next_id = 1

    def _registrar(self, exercicio):
        self._store[exercicio.id] = exercicio

    def listar(self, grupo=None):
        if grupo is None:
            return list(self._store.values())
        return [e for e in self._store.values() if e.grupo_muscular == grupo]

    def buscar_por_id(self, id):
        return self._store.get(id)

    def buscar_por_nome_normalizado(self, nome_normalizado):
        for e in self._store.values():
            if e.nome.strip().lower() == nome_normalizado:
                return e
        return None

    def criar(self, dados):
        obj = SimpleNamespace(
            id=self._next_id,
            nome=dados.nome,
            grupo_muscular=dados.grupo_muscular,
        )
        self._store[self._next_id] = obj
        self._next_id += 1
        return obj

    def atualizar(self, exercicio, dados):
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(exercicio, campo, valor)
        return exercicio

    def remover(self, exercicio):
        del self._store[exercicio.id]

    def contar_series(self, exercicio_id):
        return 0


class FakeTreinoRepository:
    def __init__(self):
        self._store: dict = {}
        self._next_id = 1

    def listar(self):
        return list(self._store.values())

    def buscar_por_id(self, id):
        return self._store.get(id)

    def criar(self, dados):
        obj = SimpleNamespace(id=self._next_id, nome=dados.nome)
        self._store[self._next_id] = obj
        self._next_id += 1
        return obj

    def atualizar(self, treino, dados):
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(treino, campo, valor)
        return treino

    def remover(self, treino):
        del self._store[treino.id]


class FakeSessaoRepository:
    def __init__(self, serie_repo=None, treino_repo=None):
        self._store: dict = {}
        self._next_id = 1
        self._serie_repo = serie_repo
        self._treino_repo = treino_repo

    def _registrar(self, sessao):
        self._store[sessao.id] = sessao

    def listar(self, limite=20, offset=0):
        items = list(self._store.values())
        return [(s, Decimal(0)) for s in items[offset : offset + limite]]

    def buscar_por_id(self, id):
        sessao = self._store.get(id)
        if sessao is None:
            return None
        if self._serie_repo is not None:
            sessao.series = self._serie_repo.listar_por_sessao(id)
        return (sessao, Decimal(0))

    def buscar_por_treino_e_data(self, treino_id, data):
        for s in self._store.values():
            if s.treino_id == treino_id and s.data == data:
                return s
        return None

    def criar(self, dados):
        treino = SimpleNamespace(nome="Treino Fake")
        if self._treino_repo is not None:
            t = self._treino_repo.buscar_por_id(dados.treino_id)
            if t is not None:
                treino = t
        obj = SimpleNamespace(
            id=self._next_id,
            treino_id=dados.treino_id,
            data=dados.data,
            observacao=getattr(dados, "observacao", None),
            series=[],
            treino=treino,
        )
        self._store[self._next_id] = obj
        self._next_id += 1
        return obj

    def atualizar(self, sessao, dados):
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(sessao, campo, valor)
        return sessao

    def remover(self, sessao):
        del self._store[sessao.id]


class FakeSerieRepository:
    def __init__(self):
        self._store: dict = {}
        self._next_id = 1
        self._sessoes_anteriores: dict = {}
        self._recordes: dict = {}

    def configurar_sessao_anterior(self, exercicio_id, sessao):
        self._sessoes_anteriores[exercicio_id] = sessao

    def configurar_recorde(self, exercicio_id, serie):
        self._recordes[exercicio_id] = serie

    def listar_por_sessao(self, sessao_id):
        return [s for s in self._store.values() if s.sessao_id == sessao_id]

    def buscar_por_id(self, id):
        return self._store.get(id)

    def criar(self, dados, sessao_id, ordem):
        obj = SimpleNamespace(
            id=self._next_id,
            sessao_id=sessao_id,
            exercicio_id=dados.exercicio_id,
            carga_kg=dados.carga_kg,
            repeticoes=dados.repeticoes,
            tipo=dados.tipo,
            ordem=ordem,
        )
        self._store[self._next_id] = obj
        self._next_id += 1
        return obj

    def atualizar(self, serie, dados):
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(serie, campo, valor)
        return serie

    def remover(self, serie):
        del self._store[serie.id]

    def buscar_sessao_anterior(self, exercicio_id, data_atual):
        return self._sessoes_anteriores.get(exercicio_id)

    def buscar_recorde(self, exercicio_id):
        return self._recordes.get(exercicio_id)

    def historico_por_exercicio(self, exercicio_id):
        return []
