from decimal import Decimal

import pytest

from overload.schemas.treino import ExercicioSugestao, TreinoCreate
from overload.services.errors import NaoEncontrado
from overload.services.treino import TreinoService
from tests.unit.fakes import FakeTreinoRepository

pytestmark = pytest.mark.unit


@pytest.fixture
def repo():
    return FakeTreinoRepository()


@pytest.fixture
def svc(repo):
    return TreinoService(repo)


def _sugestao(exercicio_id: int = 1) -> ExercicioSugestao:
    return ExercicioSugestao(
        exercicio_id=exercicio_id,
        nome="Supino",
        grupo_muscular="peito",
        carga_kg=Decimal("80"),
        repeticoes=10,
        series_validas=3,
    )


def test_buscar_sugestao_treino_inexistente_levanta_nao_encontrado(svc):
    with pytest.raises(NaoEncontrado):
        svc.buscar_sugestao(99)


def test_buscar_sugestao_treino_sem_sessao_devolve_lista_vazia(svc, repo):
    repo.criar(TreinoCreate(nome="Push"))
    resultado = svc.buscar_sugestao(1)
    assert resultado == []


def test_buscar_sugestao_repassa_lista_do_repositorio(svc, repo):
    repo.criar(TreinoCreate(nome="Push"))
    sug = _sugestao()
    repo._registrar_sugestao(1, [sug])
    resultado = svc.buscar_sugestao(1)
    assert len(resultado) == 1
    assert resultado[0].exercicio_id == 1
    assert resultado[0].carga_kg == Decimal("80")
    assert resultado[0].repeticoes == 10
