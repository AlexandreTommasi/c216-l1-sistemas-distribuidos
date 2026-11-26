import datetime
from collections import defaultdict
from decimal import Decimal

from overload.models.serie import TipoSerie
from overload.repositories.exercicio import ExercicioRepository
from overload.repositories.serie import SerieRepository
from overload.repositories.sessao import SessaoRepository
from overload.schemas.progresso import (
    Delta,
    ExecucaoAnterior,
    ExercicioProgresso,
    PontoHistorico,
    SessaoProgresso,
    StatusProgresso,
)
from overload.services.errors import NaoEncontrado


class ProgressoService:
    def __init__(
        self,
        sessao_repo: SessaoRepository,
        serie_repo: SerieRepository,
        exercicio_repo: ExercicioRepository,
    ) -> None:
        self.sessao_repo = sessao_repo
        self.serie_repo = serie_repo
        self.exercicio_repo = exercicio_repo

    def comparar_sessao(self, sessao_id: int) -> SessaoProgresso:
        sessao = self.sessao_repo.buscar_por_id(sessao_id)
        if sessao is None:
            raise NaoEncontrado(f"Sessão {sessao_id} não encontrada")

        grupos: dict[int, list] = defaultdict(list)
        for serie in sessao.series:
            if serie.tipo == TipoSerie.valida:
                grupos[serie.exercicio_id].append(serie)

        exercicios = [
            self._progresso(exercicio_id, series, sessao.data)
            for exercicio_id, series in grupos.items()
        ]

        return SessaoProgresso(
            sessao_id=sessao_id,
            data=sessao.data,
            treino=sessao.treino.nome,
            exercicios=exercicios,
        )

    def _progresso(
        self,
        exercicio_id: int,
        series: list,
        data_sessao: datetime.date,
    ) -> ExercicioProgresso:
        exercicio = self.exercicio_repo.buscar_por_id(exercicio_id)
        nome = exercicio.nome if exercicio else f"Exercício {exercicio_id}"

        carga_max = max(s.carga_kg for s in series)
        reps_total = sum(s.repeticoes for s in series)

        anterior = self.serie_repo.buscar_execucao_anterior(exercicio_id, data_sessao)

        if anterior is None:
            execucao_anterior = None
            delta = None
            status = StatusProgresso.primeira_vez
        else:
            carga_ant = anterior.carga_maxima_kg
            reps_ant = int(anterior.repeticoes_totais)
            execucao_anterior = ExecucaoAnterior(
                data=anterior.data,
                carga_maxima_kg=carga_ant,
                repeticoes_totais=reps_ant,
            )
            delta_carga = carga_max - carga_ant
            if carga_ant:
                pct = (delta_carga / carga_ant * 100).quantize(Decimal("0.01"))
            else:
                pct = Decimal("0.00")
            delta = Delta(
                carga_kg=delta_carga,
                carga_pct=float(pct),
                repeticoes=reps_total - reps_ant,
            )
            if carga_max > carga_ant or (
                carga_max == carga_ant and reps_total > reps_ant
            ):
                status = StatusProgresso.evoluiu
            elif carga_max < carga_ant:
                status = StatusProgresso.regrediu
            else:
                status = StatusProgresso.manteve

        # O recorde e medido contra o que existia ANTES desta sessao: igualar a
        # propria marca nao e recorde novo, senao todo exercicio da ultima
        # sessao aparece marcado.
        recorde_antigo = self.serie_repo.buscar_recorde(
            exercicio_id, antes_de=data_sessao
        )
        carga_antiga = recorde_antigo.carga_kg if recorde_antigo else None
        eh_recorde = carga_antiga is None or carga_max > carga_antiga
        recorde_kg = carga_max if carga_antiga is None else max(carga_max, carga_antiga)

        return ExercicioProgresso(
            exercicio_id=exercicio_id,
            nome=nome,
            carga_maxima_kg=carga_max,
            repeticoes_totais=reps_total,
            sessao_anterior=execucao_anterior,
            delta=delta,
            status=status,
            recorde_pessoal_kg=recorde_kg,
            eh_recorde=eh_recorde,
        )

    def historico_exercicio(self, exercicio_id: int) -> list[PontoHistorico]:
        if self.exercicio_repo.buscar_por_id(exercicio_id) is None:
            raise NaoEncontrado(f"Exercício {exercicio_id} não encontrado")
        rows = self.serie_repo.historico_por_exercicio(exercicio_id)
        return [
            PontoHistorico(
                data=row.data,
                carga_maxima_kg=row.carga_maxima_kg,
                repeticoes_totais=int(row.repeticoes_totais),
            )
            for row in rows
        ]
