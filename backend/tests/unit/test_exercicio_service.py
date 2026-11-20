import pytest

from overload.models.exercicio import GrupoMuscular
from overload.schemas.exercicio import ExercicioCreate, ExercicioUpdate
from overload.services.errors import Conflito, NaoEncontrado
from overload.services.exercicio import ExercicioService
from tests.unit.fakes import FakeExercicioRepository

pytestmark = pytest.mark.unit


@pytest.fixture
def repo():
    return FakeExercicioRepository()


@pytest.fixture
def svc(repo):
    return ExercicioService(repo)


def test_criar_exercicio(svc):
    e = svc.criar(ExercicioCreate(nome="Supino", grupo_muscular=GrupoMuscular.peito))
    assert e.id == 1
    assert e.nome == "Supino"


def test_criar_nome_duplicado_levanta_conflito(svc):
    svc.criar(ExercicioCreate(nome="Supino", grupo_muscular=GrupoMuscular.peito))
    with pytest.raises(Conflito):
        svc.criar(ExercicioCreate(nome=" supino ", grupo_muscular=GrupoMuscular.peito))


def test_buscar_inexistente_levanta_nao_encontrado(svc):
    with pytest.raises(NaoEncontrado):
        svc.buscar(99)


def test_buscar_existente(svc):
    criado = svc.criar(
        ExercicioCreate(nome="Agachamento", grupo_muscular=GrupoMuscular.pernas)
    )
    encontrado = svc.buscar(criado.id)
    assert encontrado.nome == "Agachamento"


def test_atualizar_nome_duplicado_levanta_conflito(svc):
    svc.criar(ExercicioCreate(nome="Supino", grupo_muscular=GrupoMuscular.peito))
    outro = svc.criar(
        ExercicioCreate(nome="Agachamento", grupo_muscular=GrupoMuscular.pernas)
    )
    with pytest.raises(Conflito):
        svc.atualizar(outro.id, ExercicioUpdate(nome="supino"))


def test_atualizar_proprio_nome_nao_levanta(svc):
    e = svc.criar(ExercicioCreate(nome="Supino", grupo_muscular=GrupoMuscular.peito))
    atualizado = svc.atualizar(e.id, ExercicioUpdate(nome=" SUPINO "))
    assert atualizado.nome == "SUPINO"


def test_remover_sem_series(svc):
    e = svc.criar(ExercicioCreate(nome="Supino", grupo_muscular=GrupoMuscular.peito))
    svc.remover(e.id)
    with pytest.raises(NaoEncontrado):
        svc.buscar(e.id)


def test_remover_com_series_levanta_conflito():
    repo = FakeExercicioRepository()
    repo.contar_series = lambda id: 3
    svc = ExercicioService(repo)
    e = svc.criar(ExercicioCreate(nome="Supino", grupo_muscular=GrupoMuscular.peito))
    with pytest.raises(Conflito):
        svc.remover(e.id)
