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
        par = self.sessao_repo.buscar_por_id(sessao_id)
        if par is None:
            raise NaoEncontrado(f"Sessão {sessao_id} não encontrada")
        sessao, _ = par

        series_validas = [s for s in sessao.series if s.tipo == TipoSerie.valida]

        grupos: dict[int, list] = defaultdict(list)
        for s in series_validas:
            grupos[s.exercicio_id].append(s)

        exercicios_progresso = []
        volume_total = Decimal("0")

        for exercicio_id, series in grupos.items():
            exercicio = self.exercicio_repo.buscar_por_id(exercicio_id)
            nome = exercicio.nome if exercicio else f"Exercício {exercicio_id}"

            carga_max = max(s.carga_kg for s in series)
            reps_total = sum(s.repeticoes for s in series)
            volume = sum(s.carga_kg * s.repeticoes for s in series)
            volume_total += volume

            sessao_ant = self.serie_repo.buscar_sessao_anterior(
                exercicio_id, sessao.data
            )
            series_ant = sessao_ant.series if sessao_ant else []

            if series_ant:
                carga_ant = max(s.carga_kg for s in series_ant)
                reps_ant = sum(s.repeticoes for s in series_ant)
                volume_ant = sum(s.carga_kg * s.repeticoes for s in series_ant)

                delta_carga = carga_max - carga_ant
                if carga_ant != 0:
                    pct = (delta_carga / carga_ant * 100).quantize(Decimal("0.01"))
                else:
                    pct = Decimal("0.00")

                exec_ant = ExecucaoAnterior(
                    data=sessao_ant.data,
                    carga_maxima_kg=carga_ant,
                    repeticoes_totais=reps_ant,
                    volume_kg=volume_ant,
                )
                delta = Delta(
                    carga_kg=delta_carga,
                    carga_pct=float(pct),
                    repeticoes=reps_total - reps_ant,
                    volume_kg=volume - volume_ant,
                )

                if carga_max > carga_ant or (
                    carga_max == carga_ant and reps_total > reps_ant
                ):
                    status = StatusProgresso.evoluiu
                elif carga_max < carga_ant:
                    status = StatusProgresso.regrediu
                else:
                    status = StatusProgresso.manteve
            else:
                exec_ant = None
                delta = None
                status = StatusProgresso.primeira_vez

            recorde_serie = self.serie_repo.buscar_recorde(exercicio_id)
            recorde_kg = recorde_serie.carga_kg if recorde_serie else carga_max

            exercicios_progresso.append(
                ExercicioProgresso(
                    exercicio_id=exercicio_id,
                    nome=nome,
                    carga_maxima_kg=carga_max,
                    repeticoes_totais=reps_total,
                    volume_kg=volume,
                    sessao_anterior=exec_ant,
                    delta=delta,
                    status=status,
                    recorde_pessoal_kg=recorde_kg,
                    eh_recorde=carga_max >= recorde_kg,
                )
            )

        return SessaoProgresso(
            sessao_id=sessao_id,
            data=sessao.data,
            treino=sessao.treino.nome,
            volume_total_kg=volume_total,
            exercicios=exercicios_progresso,
        )

    def historico_exercicio(self, exercicio_id: int) -> list[PontoHistorico]:
        if self.exercicio_repo.buscar_por_id(exercicio_id) is None:
            raise NaoEncontrado(f"Exercício {exercicio_id} não encontrado")
        rows = self.serie_repo.historico_por_exercicio(exercicio_id)
        return [
            PontoHistorico(
                data=row.data,
                carga_maxima_kg=row.carga_maxima_kg,
                volume_kg=row.volume_kg,
            )
            for row in rows
        ]
