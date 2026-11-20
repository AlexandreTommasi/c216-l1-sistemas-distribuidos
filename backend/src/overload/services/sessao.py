from sqlalchemy.orm import Session

from overload.models.sessao import Sessao
from overload.repositories.sessao import SessaoRepository
from overload.repositories.treino import TreinoRepository
from overload.schemas.sessao import SessaoCreate, SessaoUpdate
from overload.services.errors import Conflito, NaoEncontrado


class SessaoService:
    def __init__(self, db: Session) -> None:
        self.sessao_repo = SessaoRepository(db)
        self.treino_repo = TreinoRepository(db)

    def listar(self, limite: int = 20, offset: int = 0) -> list[Sessao]:
        return self.sessao_repo.listar(limite, offset)

    def buscar(self, id: int) -> Sessao:
        sessao = self.sessao_repo.buscar_por_id(id)
        if sessao is None:
            raise NaoEncontrado(f"Sessão {id} não encontrada")
        return sessao

    def criar(self, dados: SessaoCreate) -> Sessao:
        if self.treino_repo.buscar_por_id(dados.treino_id) is None:
            raise NaoEncontrado(f"Treino {dados.treino_id} não encontrado")
        existente = self.sessao_repo.buscar_por_treino_e_data(
            dados.treino_id, dados.data
        )
        if existente is not None:
            raise Conflito(
                f"Já existe sessão do treino {dados.treino_id} na data {dados.data}"
            )
        return self.sessao_repo.criar(dados)

    def atualizar(self, id: int, dados: SessaoUpdate) -> Sessao:
        sessao = self.buscar(id)
        muda_chave = dados.treino_id is not None or dados.data is not None
        if muda_chave:
            novo_treino_id = (
                dados.treino_id if dados.treino_id is not None else sessao.treino_id
            )
            nova_data = dados.data if dados.data is not None else sessao.data
            if dados.treino_id is not None:
                if self.treino_repo.buscar_por_id(novo_treino_id) is None:
                    raise NaoEncontrado(f"Treino {novo_treino_id} não encontrado")
            duplicado = self.sessao_repo.buscar_por_treino_e_data(
                novo_treino_id, nova_data
            )
            if duplicado is not None and duplicado.id != id:
                raise Conflito(
                    f"Já existe sessão do treino {novo_treino_id} na data {nova_data}"
                )
        return self.sessao_repo.atualizar(sessao, dados)

    def remover(self, id: int) -> None:
        sessao = self.buscar(id)
        self.sessao_repo.remover(sessao)
