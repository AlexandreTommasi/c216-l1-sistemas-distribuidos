from overload.models.sessao import Sessao
from overload.repositories.sessao import SessaoRepository
from overload.repositories.treino import TreinoRepository
from overload.schemas.sessao import (
    SessaoCreate,
    SessaoDetalhe,
    SessaoRead,
    SessaoUpdate,
)
from overload.services.errors import Conflito, NaoEncontrado


class SessaoService:
    def __init__(
        self, sessao_repo: SessaoRepository, treino_repo: TreinoRepository
    ) -> None:
        self.sessao_repo = sessao_repo
        self.treino_repo = treino_repo

    def _buscar_ou_404(self, id: int) -> Sessao:
        sessao = self.sessao_repo.buscar_por_id(id)
        if sessao is None:
            raise NaoEncontrado(f"Sessão {id} não encontrada")
        return sessao

    def listar(self, limite: int = 20, offset: int = 0) -> list[SessaoRead]:
        sessoes = self.sessao_repo.listar(limite, offset)
        return [SessaoRead.model_validate(s, from_attributes=True) for s in sessoes]

    def buscar(self, id: int) -> SessaoDetalhe:
        sessao = self._buscar_ou_404(id)
        return SessaoDetalhe.model_validate(sessao, from_attributes=True)

    def criar(self, dados: SessaoCreate) -> SessaoRead:
        if self.treino_repo.buscar_por_id(dados.treino_id) is None:
            raise NaoEncontrado(f"Treino {dados.treino_id} não encontrado")
        existente = self.sessao_repo.buscar_por_treino_e_data(
            dados.treino_id, dados.data
        )
        if existente is not None:
            raise Conflito(
                f"Já existe sessão do treino {dados.treino_id} na data {dados.data}"
            )
        sessao = self.sessao_repo.criar(dados)
        # re-busca com relacionamentos carregados
        sessao_nova = self._buscar_ou_404(sessao.id)
        return SessaoRead.model_validate(sessao_nova, from_attributes=True)

    def atualizar(self, id: int, dados: SessaoUpdate) -> SessaoRead:
        sessao = self._buscar_ou_404(id)
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
        self.sessao_repo.atualizar(sessao, dados)
        sessao_nova = self._buscar_ou_404(id)
        return SessaoRead.model_validate(sessao_nova, from_attributes=True)

    def remover(self, id: int) -> None:
        sessao = self._buscar_ou_404(id)
        self.sessao_repo.remover(sessao)
