import datetime
from decimal import Decimal
from types import SimpleNamespace

import pytest

from overload.models.serie import TipoSerie
from overload.schemas.progresso import StatusProgresso
from overload.services.errors import NaoEncontrado
from overload.services.progresso import ProgressoService
from tests.unit.fakes import (
    FakeExercicioRepository,
    FakeSerieRepository,
    FakeSessaoRepository,
)

pytestmark = pytest.mark.unit

DATA_ATUAL = datetime.date(2024, 2, 1)
DATA_ANT = datetime.date(2024, 1, 1)
EXERCICIO_ID = 1


def _svc_com_anterior(
    carga_atual,
    reps_atual,
    carga_ant=None,
    reps_ant=None,
    recorde_kg=None,
):
    exercicio_repo = FakeExercicioRepository()
    exercicio_repo._registrar(SimpleNamespace(id=EXERCICIO_ID, nome="Supino"))

    sessao = SimpleNamespace(
        id=1,
        data=DATA_ATUAL,
        treino=SimpleNamespace(nome="Treino A"),
        series=[
            SimpleNamespace(
                tipo=TipoSerie.valida,
                exercicio_id=EXERCICIO_ID,
                carga_kg=carga_atual,
                repeticoes=reps_atual,
            )
        ],
    )
    sessao_repo = FakeSessaoRepository()
    sessao_repo._registrar(sessao)

    serie_repo = FakeSerieRepository()

    if carga_ant is not None and reps_ant is not None:
        sessao_ant = SimpleNamespace(
            id=2,
            data=DATA_ANT,
            series=[
                SimpleNamespace(
                    tipo=TipoSerie.valida,
                    exercicio_id=EXERCICIO_ID,
                    carga_kg=carga_ant,
                    repeticoes=reps_ant,
                )
            ],
        )
        serie_repo.configurar_sessao_anterior(EXERCICIO_ID, sessao_ant)

    if recorde_kg is not None:
        serie_repo.configurar_recorde(
            EXERCICIO_ID, SimpleNamespace(carga_kg=recorde_kg)
        )

    return ProgressoService(sessao_repo, serie_repo, exercicio_repo)


def test_sessao_inexistente_levanta_nao_encontrado():
    svc = ProgressoService(
        FakeSessaoRepository(), FakeSerieRepository(), FakeExercicioRepository()
    )
    with pytest.raises(NaoEncontrado):
        svc.comparar_sessao(99)


def test_primeira_vez_sem_execucao_anterior():
    svc = _svc_com_anterior(Decimal("100"), 10)
    resultado = svc.comparar_sessao(1)
    ex = resultado.exercicios[0]
    assert ex.status == StatusProgresso.primeira_vez
    assert ex.sessao_anterior is None
    assert ex.delta is None


@pytest.mark.parametrize(
    "carga_atual, reps_atual, carga_ant, reps_ant, expected",
    [
        (Decimal("100"), 10, Decimal("90"), 10, StatusProgresso.evoluiu),
        (Decimal("90"), 12, Decimal("90"), 10, StatusProgresso.evoluiu),
        (Decimal("90"), 10, Decimal("90"), 10, StatusProgresso.manteve),
        (Decimal("80"), 10, Decimal("90"), 10, StatusProgresso.regrediu),
    ],
    ids=["carga_sobe", "reps_sobem", "empate", "carga_cai"],
)
def test_status_progresso(carga_atual, reps_atual, carga_ant, reps_ant, expected):
    svc = _svc_com_anterior(carga_atual, reps_atual, carga_ant, reps_ant)
    resultado = svc.comparar_sessao(1)
    assert resultado.exercicios[0].status == expected


def test_volume_calculo_correto():
    svc = _svc_com_anterior(Decimal("100"), 10)
    resultado = svc.comparar_sessao(1)
    assert resultado.exercicios[0].volume_kg == Decimal("1000")
    assert resultado.volume_total_kg == Decimal("1000")


def test_percentual_duas_casas_decimais():
    svc = _svc_com_anterior(Decimal("299"), 10, Decimal("300"), 10)
    resultado = svc.comparar_sessao(1)
    assert resultado.exercicios[0].delta.carga_pct == -0.33


@pytest.mark.parametrize(
    "carga_atual, recorde_kg, esperado",
    [
        (Decimal("110"), Decimal("100"), True),
        (Decimal("100"), Decimal("100"), True),
        (Decimal("90"), Decimal("100"), False),
    ],
    ids=["supera", "iguala", "abaixo"],
)
def test_eh_recorde(carga_atual, recorde_kg, esperado):
    svc = _svc_com_anterior(carga_atual, 10, recorde_kg=recorde_kg)
    resultado = svc.comparar_sessao(1)
    assert resultado.exercicios[0].eh_recorde == esperado


def test_aquecimento_nao_entra_no_calculo():
    exercicio_repo = FakeExercicioRepository()
    exercicio_repo._registrar(SimpleNamespace(id=EXERCICIO_ID, nome="Supino"))

    sessao = SimpleNamespace(
        id=1,
        data=DATA_ATUAL,
        treino=SimpleNamespace(nome="Treino A"),
        series=[
            SimpleNamespace(
                tipo=TipoSerie.aquecimento,
                exercicio_id=EXERCICIO_ID,
                carga_kg=Decimal("40"),
                repeticoes=15,
            ),
            SimpleNamespace(
                tipo=TipoSerie.valida,
                exercicio_id=EXERCICIO_ID,
                carga_kg=Decimal("100"),
                repeticoes=10,
            ),
        ],
    )
    sessao_repo = FakeSessaoRepository()
    sessao_repo._registrar(sessao)

    svc = ProgressoService(sessao_repo, FakeSerieRepository(), exercicio_repo)
    resultado = svc.comparar_sessao(1)

    assert len(resultado.exercicios) == 1
    assert resultado.exercicios[0].carga_maxima_kg == Decimal("100")
    assert resultado.exercicios[0].repeticoes_totais == 10
