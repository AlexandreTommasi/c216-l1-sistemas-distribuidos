import datetime
from decimal import Decimal
from types import SimpleNamespace

import pytest

from overload.models.exercicio import GrupoMuscular
from overload.schemas.exercicio import ExercicioCreate
from overload.schemas.serie import SerieCreate, SerieUpdate
from overload.services.errors import NaoEncontrado
from overload.services.serie import SerieService
from tests.unit.fakes import (
    FakeExercicioRepository,
    FakeSerieRepository,
    FakeSessaoRepository,
)

pytestmark = pytest.mark.unit

_DATA = datetime.date(2024, 1, 15)
_CARGA = Decimal("80")


def _build():
    serie_repo = FakeSerieRepository()
    sessao_repo = FakeSessaoRepository(serie_repo=serie_repo)
    exercicio_repo = FakeExercicioRepository()
    sessao_repo._registrar(SimpleNamespace(id=1, data=_DATA, treino_id=1, series=[]))
    exercicio_repo.criar(
        ExercicioCreate(nome="Supino", grupo_muscular=GrupoMuscular.peito)
    )
    return SerieService(serie_repo, sessao_repo, exercicio_repo)


def test_criar_sessao_inexistente_levanta_nao_encontrado():
    svc = SerieService(
        FakeSerieRepository(), FakeSessaoRepository(), FakeExercicioRepository()
    )
    with pytest.raises(NaoEncontrado):
        svc.criar(99, SerieCreate(exercicio_id=1, carga_kg=_CARGA, repeticoes=10))


def test_criar_exercicio_inexistente_levanta_nao_encontrado():
    serie_repo = FakeSerieRepository()
    sessao_repo = FakeSessaoRepository(serie_repo=serie_repo)
    sessao_repo._registrar(SimpleNamespace(id=1, data=_DATA, treino_id=1, series=[]))
    svc = SerieService(serie_repo, sessao_repo, FakeExercicioRepository())
    with pytest.raises(NaoEncontrado):
        svc.criar(1, SerieCreate(exercicio_id=99, carga_kg=_CARGA, repeticoes=10))


def test_ordem_calculada_automaticamente():
    svc = _build()
    dados = SerieCreate(exercicio_id=1, carga_kg=_CARGA, repeticoes=10)
    s1 = svc.criar(1, dados)
    s2 = svc.criar(1, dados)
    assert s1.ordem == 1
    assert s2.ordem == 2


def test_ordem_informada_e_respeitada():
    svc = _build()
    dados = SerieCreate(exercicio_id=1, carga_kg=_CARGA, repeticoes=10, ordem=5)
    s = svc.criar(1, dados)
    assert s.ordem == 5


def test_buscar_inexistente_levanta_nao_encontrado():
    svc = _build()
    with pytest.raises(NaoEncontrado):
        svc.buscar(99)


def test_atualizar_exercicio_inexistente_levanta_nao_encontrado():
    svc = _build()
    s = svc.criar(1, SerieCreate(exercicio_id=1, carga_kg=_CARGA, repeticoes=10))
    with pytest.raises(NaoEncontrado):
        svc.atualizar(s.id, SerieUpdate(exercicio_id=99))


def test_remover_serie():
    svc = _build()
    s = svc.criar(1, SerieCreate(exercicio_id=1, carga_kg=_CARGA, repeticoes=10))
    svc.remover(s.id)
    with pytest.raises(NaoEncontrado):
        svc.buscar(s.id)
