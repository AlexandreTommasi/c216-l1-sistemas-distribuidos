"""seed: 10 semanas de historico de treino

Revision ID: f1e2d3c4b5a6
Revises: 659f8154f04c
Create Date: 2026-11-22 00:00:00.000000

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "f1e2d3c4b5a6"
down_revision = "659f8154f04c"
branch_labels = None
depends_on = None


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------


def _exec(sql: str, params: dict | None = None):
    conn = op.get_bind()
    if params:
        return conn.execute(sa.text(sql), params)
    return conn.execute(sa.text(sql))


def _insert_treino(nome: str) -> int:
    row = _exec(
        "INSERT INTO treino (nome) VALUES (:nome) RETURNING id",
        {"nome": nome},
    ).fetchone()
    return row[0]


def _insert_exercicio(nome: str, grupo: str) -> int:
    row = _exec(
        "INSERT INTO exercicio (nome, grupo_muscular)"
        " VALUES (:nome, :grupo) RETURNING id",
        {"nome": nome, "grupo": grupo},
    ).fetchone()
    return row[0]


def _insert_sessao(treino_id: int, data: str, observacao: str | None = None) -> int:
    row = _exec(
        "INSERT INTO sessao (treino_id, data, observacao)"
        " VALUES (:tid, :d, :obs) RETURNING id",
        {"tid": treino_id, "d": data, "obs": observacao},
    ).fetchone()
    return row[0]


def _insert_serie(
    sessao_id: int,
    exercicio_id: int,
    ordem: int,
    repeticoes: int,
    carga_kg: float,
    tipo: str,
) -> None:
    _exec(
        """
        INSERT INTO serie (sessao_id, exercicio_id, ordem, repeticoes, carga_kg, tipo)
        VALUES (:sid, :eid, :ord, :rep, :ckg, :tipo)
        """,
        {
            "sid": sessao_id,
            "eid": exercicio_id,
            "ord": ordem,
            "rep": repeticoes,
            "ckg": carga_kg,
            "tipo": tipo,
        },
    )


# ---------------------------------------------------------------------------
# upgrade
# ---------------------------------------------------------------------------


def upgrade() -> None:
    # -- treinos ---------------------------------------------------------------
    push_id = _insert_treino("Push")
    pull_id = _insert_treino("Pull")
    legs_id = _insert_treino("Legs")

    # -- exercicios ------------------------------------------------------------
    # Push (5)
    supino_id = _insert_exercicio("supino inclinado com halteres", "peito")
    dev_mil_id = _insert_exercicio("desenvolvimento militar", "ombros")
    crucifixo_id = _insert_exercicio("crucifixo na maquina", "peito")
    tri_corda_id = _insert_exercicio("triceps corda", "triceps")
    tri_frances_id = _insert_exercicio("triceps frances", "triceps")

    # Pull (5)
    pulldown_id = _insert_exercicio("pulldown", "costas")
    remada_curv_id = _insert_exercicio("remada curvada", "costas")
    remada_uni_id = _insert_exercicio("remada unilateral", "costas")
    rosca_bay_id = _insert_exercicio("rosca bayesiana", "biceps")
    rosca_mart_id = _insert_exercicio("rosca martelo", "biceps")

    # Legs (5)
    agach_id = _insert_exercicio("agachamento livre", "pernas")
    bulgaro_id = _insert_exercicio("bulgaro", "pernas")
    legpress_id = _insert_exercicio("leg press", "pernas")
    flexora_id = _insert_exercicio("cadeira flexora", "pernas")
    pant_id = _insert_exercicio("panturrilha em pe", "panturrilha")

    # -- sessoes e series ------------------------------------------------------
    # 10 semanas: Push=segunda, Pull=quarta, Legs=sexta
    # Semana 1: 2026-09-14 a 2026-09-18
    # Semana 10: 2026-11-16 a 2026-11-21

    # Datas das sessoes Push (segundas-feiras)
    push_dates = [
        "2026-09-14",
        "2026-09-21",
        "2026-09-28",
        "2026-10-05",
        "2026-10-12",
        "2026-10-19",
        "2026-10-26",
        "2026-11-02",
        "2026-11-09",
        "2026-11-16",
    ]

    # Datas das sessoes Pull (quartas-feiras)
    pull_dates = [
        "2026-09-16",
        "2026-09-23",
        "2026-09-30",
        "2026-10-07",
        "2026-10-14",
        "2026-10-21",
        "2026-10-28",
        "2026-11-04",
        "2026-11-11",
        "2026-11-18",
    ]

    # Datas das sessoes Legs (sextas-feiras)
    legs_dates = [
        "2026-09-18",
        "2026-09-25",
        "2026-10-02",
        "2026-10-09",
        "2026-10-16",
        "2026-10-23",
        "2026-10-30",
        "2026-11-06",
        "2026-11-13",
        "2026-11-21",
    ]

    _seed_push(
        push_id,
        push_dates,
        supino_id,
        dev_mil_id,
        crucifixo_id,
        tri_corda_id,
        tri_frances_id,
    )
    _seed_pull(
        pull_id,
        pull_dates,
        pulldown_id,
        remada_curv_id,
        remada_uni_id,
        rosca_bay_id,
        rosca_mart_id,
    )
    _seed_legs(
        legs_id, legs_dates, agach_id, bulgaro_id, legpress_id, flexora_id, pant_id
    )


# ---------------------------------------------------------------------------
# PUSH sessions
# Progressao supino: 27.5 (s1-3 estagnacao), 30 (s4-5), 32.5 (s6 dia ruim: drop),
#                   30 (s7), 32.5 (s8-9), 35 PR (s10)
# ---------------------------------------------------------------------------


def _seed_push(
    treino_id,
    dates,
    supino_id,
    dev_mil_id,
    crucifixo_id,
    tri_corda_id,
    tri_frances_id,
):
    # (carga_supino, reps_supino_validas, dia_ruim)
    supino_plan = [
        (27.5, [10, 10, 9], False),  # s1 estagnacao
        (27.5, [10, 10, 9], False),  # s2
        (27.5, [10, 10, 10], False),  # s3
        (30.0, [8, 8, 7], False),  # s4 progressao
        (30.0, [9, 9, 8], False),  # s5
        (27.5, [6, 6, 5], True),  # s6 dia ruim
        (30.0, [8, 8, 8], False),  # s7 recuperacao
        (32.5, [7, 7, 6], False),  # s8
        (32.5, [8, 8, 7], False),  # s9
        (35.0, [9, 8, 8], False),  # s10 PR
    ]

    for i, date in enumerate(dates):
        obs = "dia ruim, carga reduzida" if supino_plan[i][2] else None
        sid = _insert_sessao(treino_id, date, obs)
        order = 1

        # supino inclinado: aquecimento + preparatoria + 3 validas
        _insert_serie(sid, supino_id, order, 15, 20.0, "aquecimento")
        order += 1
        _insert_serie(sid, supino_id, order, 10, 25.0, "preparatoria")
        order += 1
        carga_s, reps_s, _ = supino_plan[i]
        for rep in reps_s:
            _insert_serie(sid, supino_id, order, rep, carga_s, "valida")
            order += 1

        # desenvolvimento militar: progressao linear 40→50
        base_dev = 40.0 + i * 1.0 if i < 10 else 50.0
        _insert_serie(sid, dev_mil_id, order, 10, 30.0, "aquecimento")
        order += 1
        for rep in [10, 9, 8]:
            _insert_serie(sid, dev_mil_id, order, rep, base_dev, "valida")
            order += 1

        # crucifixo na maquina: 3 validas (carga constante)
        for rep in [12, 12, 10]:
            _insert_serie(sid, crucifixo_id, order, rep, 40.0, "valida")
            order += 1

        # triceps corda: 3 validas, progressao leve
        carga_tc = 25.0 + (i // 3) * 2.5
        for rep in [15, 12, 12]:
            _insert_serie(sid, tri_corda_id, order, rep, carga_tc, "valida")
            order += 1

        # triceps frances: 3 validas, carga constante
        for rep in [12, 10, 10]:
            _insert_serie(sid, tri_frances_id, order, rep, 20.0, "valida")
            order += 1

    # series por sessao: 1+1+3 + 1+3 + 3 + 3 + 3 = 18 series
    # 10 sessoes x 18 = 180 series Push


# ---------------------------------------------------------------------------
# PULL sessions
# Progressao pulldown: 50 (s1-2), 55 (s3-5), 60 (s6-7 dia ruim s7: drop),
#                     55 (s8), 60 (s9), 65 PR (s10)
# ---------------------------------------------------------------------------


def _seed_pull(
    treino_id,
    dates,
    pulldown_id,
    remada_curv_id,
    remada_uni_id,
    rosca_bay_id,
    rosca_mart_id,
):
    pulldown_plan = [
        (50.0, [10, 10, 9], False),
        (50.0, [10, 10, 10], False),
        (55.0, [9, 9, 8], False),
        (55.0, [9, 9, 9], False),
        (55.0, [10, 10, 9], False),
        (60.0, [8, 7, 7], False),
        (55.0, [5, 5, 4], True),  # dia ruim s7
        (55.0, [9, 9, 8], False),
        (60.0, [9, 8, 8], False),
        (65.0, [8, 8, 7], False),  # PR s10
    ]

    for i, date in enumerate(dates):
        obs = "dia ruim, falta de disposicao" if pulldown_plan[i][2] else None
        sid = _insert_sessao(treino_id, date, obs)
        order = 1

        # pulldown: aquecimento + preparatoria + 3 validas
        _insert_serie(sid, pulldown_id, order, 15, 30.0, "aquecimento")
        order += 1
        _insert_serie(sid, pulldown_id, order, 10, 40.0, "preparatoria")
        order += 1
        carga_p, reps_p, _ = pulldown_plan[i]
        for rep in reps_p:
            _insert_serie(sid, pulldown_id, order, rep, carga_p, "valida")
            order += 1

        # remada curvada: 3 validas, progressao
        base_rc = 50.0 + (i // 2) * 2.5
        for rep in [10, 10, 8]:
            _insert_serie(sid, remada_curv_id, order, rep, base_rc, "valida")
            order += 1

        # remada unilateral: 3 validas (por lado — registrado por serie)
        for rep in [12, 12, 10]:
            _insert_serie(sid, remada_uni_id, order, rep, 25.0, "valida")
            order += 1

        # rosca bayesiana: 3 validas
        carga_rb = 12.5 + (i // 4) * 1.25
        for rep in [12, 10, 10]:
            _insert_serie(sid, rosca_bay_id, order, rep, carga_rb, "valida")
            order += 1

        # rosca martelo: 3 validas
        for rep in [12, 12, 10]:
            _insert_serie(sid, rosca_mart_id, order, rep, 16.0, "valida")
            order += 1

    # series por sessao: 1+1+3 + 3 + 3 + 3 + 3 = 17 series
    # 10 sessoes x 17 = 170 series Pull


# ---------------------------------------------------------------------------
# LEGS sessions
# Progressao agachamento: 60 (s1-3), 70 (s4-5), 65 (s6 dia ruim),
#                        70 (s7-8), 80 (s9), 85 PR (s10)
# ---------------------------------------------------------------------------


def _seed_legs(
    treino_id,
    dates,
    agach_id,
    bulgaro_id,
    legpress_id,
    flexora_id,
    pant_id,
):
    agach_plan = [
        (60.0, [8, 8, 7], False),
        (60.0, [8, 8, 8], False),
        (60.0, [9, 9, 8], False),
        (70.0, [7, 7, 6], False),
        (70.0, [8, 8, 7], False),
        (65.0, [5, 5, 4], True),  # dia ruim s6
        (70.0, [8, 8, 8], False),
        (70.0, [9, 9, 8], False),
        (80.0, [7, 7, 6], False),
        (85.0, [7, 6, 6], False),  # PR s10
    ]

    for i, date in enumerate(dates):
        obs = "dia ruim, joelho incomodando" if agach_plan[i][2] else None
        sid = _insert_sessao(treino_id, date, obs)
        order = 1

        # agachamento livre: aquecimento + preparatoria + 3 validas
        _insert_serie(sid, agach_id, order, 15, 40.0, "aquecimento")
        order += 1
        _insert_serie(sid, agach_id, order, 8, 55.0, "preparatoria")
        order += 1
        carga_a, reps_a, _ = agach_plan[i]
        for rep in reps_a:
            _insert_serie(sid, agach_id, order, rep, carga_a, "valida")
            order += 1

        # bulgaro: 3 validas por perna (ordem continua)
        base_bul = 20.0 + (i // 3) * 2.5
        for rep in [10, 10, 8]:
            _insert_serie(sid, bulgaro_id, order, rep, base_bul, "valida")
            order += 1

        # leg press: aquecimento + 3 validas
        _insert_serie(sid, legpress_id, order, 15, 80.0, "aquecimento")
        order += 1
        carga_lp = 120.0 + (i // 2) * 10.0
        for rep in [12, 12, 10]:
            _insert_serie(sid, legpress_id, order, rep, carga_lp, "valida")
            order += 1

        # cadeira flexora: 3 validas
        for rep in [12, 12, 10]:
            _insert_serie(sid, flexora_id, order, rep, 35.0, "valida")
            order += 1

        # panturrilha em pe: 3 validas
        for rep in [20, 18, 15]:
            _insert_serie(sid, pant_id, order, rep, 60.0, "valida")
            order += 1

    # series por sessao: 1+1+3 + 3 + 1+3 + 3 + 3 = 18 series
    # 10 sessoes x 18 = 180 series Legs


# ---------------------------------------------------------------------------
# downgrade: remove exatamente o que o upgrade inseriu
# ---------------------------------------------------------------------------


def downgrade() -> None:
    # Exercicios inseridos (nomes normalizados = lowercase)
    nomes_exercicios = [
        "supino inclinado com halteres",
        "desenvolvimento militar",
        "crucifixo na maquina",
        "triceps corda",
        "triceps frances",
        "pulldown",
        "remada curvada",
        "remada unilateral",
        "rosca bayesiana",
        "rosca martelo",
        "agachamento livre",
        "bulgaro",
        "leg press",
        "cadeira flexora",
        "panturrilha em pe",
    ]

    # Treinos inseridos
    nomes_treinos = ["Push", "Pull", "Legs"]

    # Remove sessoes e series em cascata via FK ondelete=CASCADE
    for nome in nomes_treinos:
        _exec(
            """
            DELETE FROM sessao
            WHERE treino_id = (SELECT id FROM treino WHERE nome = :nome)
            """,
            {"nome": nome},
        )
        _exec("DELETE FROM treino WHERE nome = :nome", {"nome": nome})

    for nome in nomes_exercicios:
        _exec("DELETE FROM exercicio WHERE nome = :nome", {"nome": nome})
