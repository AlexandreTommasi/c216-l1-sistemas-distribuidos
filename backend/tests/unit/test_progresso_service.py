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


def _serie(exercicio_id, carga, reps, tipo=TipoSerie.valida):
    return SimpleNamespace(
        tipo=tipo,
        exercicio_id=exercicio_id,
        carga_kg=carga,
        repeticoes=reps,
    )


def _execucao(carga, reps, data=DATA_ANT):
    return SimpleNamespace(
        data=data,
        carga_maxima_kg=carga,
        repeticoes_totais=reps,
    )


def _montar(series, execucoes_anteriores=None, recordes=None, nomes=None):
    exercicio_repo = FakeExercicioRepository()
    for id_, nome in (nomes or {EXERCICIO_ID: "Supino"}).items():
        exercicio_repo._registrar(SimpleNamespace(id=id_, nome=nome))

    sessao_repo = FakeSessaoRepository()
    sessao_repo._registrar(
        SimpleNamespace(
            id=1,
            data=DATA_ATUAL,
            treino=SimpleNamespace(nome="Treino A"),
            series=series,
        )
    )

    serie_repo = FakeSerieRepository()
    for id_, execucao in (execucoes_anteriores or {}).items():
        serie_repo.configurar_execucao_anterior(id_, execucao)
    for id_, carga in (recordes or {}).items():
        serie_repo.configurar_recorde(id_, SimpleNamespace(carga_kg=carga))

    return ProgressoService(sessao_repo, serie_repo, exercicio_repo)


def _svc_simples(carga_atual, reps_atual, carga_ant=None, reps_ant=None, recorde=None):
    execucoes = None
    if carga_ant is not None and reps_ant is not None:
        execucoes = {EXERCICIO_ID: _execucao(carga_ant, reps_ant)}
    return _montar(
        series=[_serie(EXERCICIO_ID, carga_atual, reps_atual)],
        execucoes_anteriores=execucoes,
        recordes={EXERCICIO_ID: recorde} if recorde is not None else None,
    )


def test_sessao_inexistente_levanta_nao_encontrado():
    svc = ProgressoService(
        FakeSessaoRepository(), FakeSerieRepository(), FakeExercicioRepository()
    )
    with pytest.raises(NaoEncontrado):
        svc.comparar_sessao(99)


def test_primeira_vez_sem_execucao_anterior():
    svc = _svc_simples(Decimal("100"), 10)
    ex = svc.comparar_sessao(1).exercicios[0]
    assert ex.status == StatusProgresso.primeira_vez
    assert ex.sessao_anterior is None
    assert ex.delta is None


@pytest.mark.parametrize(
    "carga_atual, reps_atual, carga_ant, reps_ant, esperado",
    [
        (Decimal("100"), 10, Decimal("90"), 10, StatusProgresso.evoluiu),
        (Decimal("90"), 12, Decimal("90"), 10, StatusProgresso.evoluiu),
        (Decimal("90"), 10, Decimal("90"), 10, StatusProgresso.manteve),
        (Decimal("80"), 10, Decimal("90"), 10, StatusProgresso.regrediu),
    ],
    ids=["carga_sobe", "reps_sobem", "empate", "carga_cai"],
)
def test_status_progresso(carga_atual, reps_atual, carga_ant, reps_ant, esperado):
    svc = _svc_simples(carga_atual, reps_atual, carga_ant, reps_ant)
    assert svc.comparar_sessao(1).exercicios[0].status == esperado


def test_cada_exercicio_compara_com_a_propria_execucao_anterior():
    # Regressao: a comparacao ja usou o maximo e o total da sessao anterior
    # INTEIRA, entao exercicios leves apareciam despencando contra a carga de
    # um exercicio pesado feito no mesmo dia.
    svc = _montar(
        series=[
            _serie(1, Decimal("85"), 7),
            _serie(2, Decimal("27.5"), 10),
        ],
        execucoes_anteriores={
            1: _execucao(Decimal("80"), 7),
            2: _execucao(Decimal("25"), 10),
        },
        nomes={1: "Agachamento", 2: "Bulgaro"},
    )

    por_id = {e.exercicio_id: e for e in svc.comparar_sessao(1).exercicios}

    assert por_id[1].sessao_anterior.carga_maxima_kg == Decimal("80")
    assert por_id[1].delta.carga_kg == Decimal("5")
    assert por_id[1].status == StatusProgresso.evoluiu

    assert por_id[2].sessao_anterior.carga_maxima_kg == Decimal("25")
    assert por_id[2].delta.carga_kg == Decimal("2.5")
    assert por_id[2].status == StatusProgresso.evoluiu


def test_percentual_duas_casas_decimais():
    svc = _svc_simples(Decimal("299"), 10, Decimal("300"), 10)
    assert svc.comparar_sessao(1).exercicios[0].delta.carga_pct == -0.33


@pytest.mark.parametrize(
    "carga_atual, recorde_anterior, esperado",
    [
        (Decimal("110"), Decimal("100"), True),
        (Decimal("100"), Decimal("100"), False),
        (Decimal("90"), Decimal("100"), False),
    ],
    ids=["supera", "iguala", "abaixo"],
)
def test_eh_recorde(carga_atual, recorde_anterior, esperado):
    # Igualar a propria marca nao e recorde novo: o recorde e medido contra o
    # que existia antes desta sessao.
    svc = _svc_simples(carga_atual, 10, recorde=recorde_anterior)
    assert svc.comparar_sessao(1).exercicios[0].eh_recorde == esperado


def test_sem_recorde_anterior_a_primeira_marca_e_recorde():
    svc = _svc_simples(Decimal("60"), 8)
    ex = svc.comparar_sessao(1).exercicios[0]
    assert ex.eh_recorde is True
    assert ex.recorde_pessoal_kg == Decimal("60")


def test_aquecimento_nao_entra_no_calculo():
    svc = _montar(
        series=[
            _serie(EXERCICIO_ID, Decimal("40"), 15, tipo=TipoSerie.aquecimento),
            _serie(EXERCICIO_ID, Decimal("100"), 10),
        ]
    )
    resultado = svc.comparar_sessao(1)

    assert len(resultado.exercicios) == 1
    assert resultado.exercicios[0].carga_maxima_kg == Decimal("100")
    assert resultado.exercicios[0].repeticoes_totais == 10
