import datetime
from decimal import Decimal

import pytest

from overload.schemas.sessao import SessaoCreate, SessaoRead, SessaoUpdate
from overload.schemas.treino import TreinoCreate
from overload.services.errors import Conflito, NaoEncontrado
from overload.services.sessao import SessaoService
from tests.unit.fakes import FakeSessaoRepository, FakeTreinoRepository

pytestmark = pytest.mark.unit

DATA1 = datetime.date(2024, 1, 10)
DATA2 = datetime.date(2024, 1, 20)


@pytest.fixture
def svc():
    treino_repo = FakeTreinoRepository()
    treino_repo.criar(TreinoCreate(nome="Treino A"))
    sessao_repo = FakeSessaoRepository(treino_repo=treino_repo)
    return SessaoService(sessao_repo, treino_repo)


def test_criar_sessao(svc):
    s = svc.criar(SessaoCreate(treino_id=1, data=DATA1))
    assert s.id == 1
    assert s.treino_id == 1
    assert s.data == DATA1


def test_criar_treino_inexistente_levanta_nao_encontrado(svc):
    with pytest.raises(NaoEncontrado):
        svc.criar(SessaoCreate(treino_id=99, data=DATA1))


def test_criar_sessao_duplicada_levanta_conflito(svc):
    svc.criar(SessaoCreate(treino_id=1, data=DATA1))
    with pytest.raises(Conflito):
        svc.criar(SessaoCreate(treino_id=1, data=DATA1))


def test_buscar_inexistente_levanta_nao_encontrado(svc):
    with pytest.raises(NaoEncontrado):
        svc.buscar(99)


def test_atualizar_data_para_existente_levanta_conflito(svc):
    svc.criar(SessaoCreate(treino_id=1, data=DATA1))
    s2 = svc.criar(SessaoCreate(treino_id=1, data=DATA2))
    with pytest.raises(Conflito):
        svc.atualizar(s2.id, SessaoUpdate(data=DATA1))


def test_atualizar_treino_inexistente_levanta_nao_encontrado(svc):
    s = svc.criar(SessaoCreate(treino_id=1, data=DATA1))
    with pytest.raises(NaoEncontrado):
        svc.atualizar(s.id, SessaoUpdate(treino_id=99))


def test_remover_sessao(svc):
    s = svc.criar(SessaoCreate(treino_id=1, data=DATA1))
    svc.remover(s.id)
    with pytest.raises(NaoEncontrado):
        svc.buscar(s.id)


def test_listar_devolve_sessao_read_com_volume_total_kg():
    treino_repo = FakeTreinoRepository()
    treino_repo.criar(TreinoCreate(nome="Treino B"))

    volume_esperado = Decimal("1500.000")
    sessao_repo = FakeSessaoRepository(treino_repo=treino_repo)

    # Injeta par (sessao, volume) diretamente, simulando o repositório real
    from types import SimpleNamespace

    sessao_fake = SimpleNamespace(
        id=99,
        treino_id=1,
        data=DATA1,
        observacao=None,
        series=[],
        treino=SimpleNamespace(nome="Treino B"),
    )
    sessao_repo._store[99] = sessao_fake
    sessao_repo.listar = lambda limite=20, offset=0: [(sessao_fake, volume_esperado)]

    svc = SessaoService(sessao_repo, treino_repo)
    resultado = svc.listar()

    assert len(resultado) == 1
    r = resultado[0]
    assert isinstance(r, SessaoRead)
    assert r.volume_total_kg == volume_esperado
    assert r.treino_nome == "Treino B"
