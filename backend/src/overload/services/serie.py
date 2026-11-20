from sqlalchemy.orm import Session

from overload.models.serie import Serie
from overload.repositories.exercicio import ExercicioRepository
from overload.repositories.serie import SerieRepository
from overload.repositories.sessao import SessaoRepository
from overload.schemas.serie import SerieCreate, SerieUpdate
from overload.services.errors import NaoEncontrado


class SerieService:
    def __init__(self, db: Session) -> None:
        self.serie_repo = SerieRepository(db)
        self.sessao_repo = SessaoRepository(db)
        self.exercicio_repo = ExercicioRepository(db)

    def listar_por_sessao(self, sessao_id: int) -> list[Serie]:
        if self.sessao_repo.buscar_por_id(sessao_id) is None:
            raise NaoEncontrado(f"Sessão {sessao_id} não encontrada")
        return self.serie_repo.listar_por_sessao(sessao_id)

    def criar(self, sessao_id: int, dados: SerieCreate) -> Serie:
        sessao = self.sessao_repo.buscar_por_id(sessao_id)
        if sessao is None:
            raise NaoEncontrado(f"Sessão {sessao_id} não encontrada")
        if self.exercicio_repo.buscar_por_id(dados.exercicio_id) is None:
            raise NaoEncontrado(f"Exercício {dados.exercicio_id} não encontrado")
        if dados.ordem is not None:
            ordem = dados.ordem
        else:
            ordem = max((s.ordem for s in sessao.series), default=0) + 1
        return self.serie_repo.criar(dados, sessao_id, ordem)

    def buscar(self, id: int) -> Serie:
        serie = self.serie_repo.buscar_por_id(id)
        if serie is None:
            raise NaoEncontrado(f"Série {id} não encontrada")
        return serie

    def atualizar(self, id: int, dados: SerieUpdate) -> Serie:
        serie = self.buscar(id)
        if dados.exercicio_id is not None:
            if self.exercicio_repo.buscar_por_id(dados.exercicio_id) is None:
                raise NaoEncontrado(
                    f"Exercício {dados.exercicio_id} não encontrado"
                )
        return self.serie_repo.atualizar(serie, dados)

    def remover(self, id: int) -> None:
        serie = self.buscar(id)
        self.serie_repo.remover(serie)
