from decimal import Decimal

from overload.models.sessao import Sessao
from overload.repositories.sessao import SessaoRepository
from overload.repositories.treino import TreinoRepository
from overload.schemas.serie import SerieRead
from overload.schemas.sessao import (
    SessaoCreate,
    SessaoDetalhe,
    SessaoRead,
    SessaoUpdate,
)
from overload.services.errors import Conflito, NaoEncontrado


def _montar_read(sessao: Sessao, volume: Decimal) -> SessaoRead:
    return SessaoRead.model_validate(
        {
            "id": sessao.id,
            "treino_id": sessao.treino_id,
            "data": sessao.data,
            "observacao": sessao.observacao,
            "treino_nome": sessao.treino.nome,
            "volume_total_kg": Decimal(str(volume))
            if volume is not None
            else Decimal(0),
        }
    )


def _montar_detalhe(sessao: Sessao, volume: Decimal) -> SessaoDetalhe:
    return SessaoDetalhe.model_validate(
        {
            "id": sessao.id,
            "treino_id": sessao.treino_id,
            "data": sessao.data,
            "observacao": sessao.observacao,
            "treino_nome": sessao.treino.nome,
            "volume_total_kg": Decimal(str(volume))
            if volume is not None
            else Decimal(0),
            "series": [
                SerieRead.model_validate(s, from_attributes=True) for s in sessao.series
            ],
        }
    )


class SessaoService:
    def __init__(
        self, sessao_repo: SessaoRepository, treino_repo: TreinoRepository
    ) -> None:
        self.sessao_repo = sessao_repo
        self.treino_repo = treino_repo

    def _buscar_ou_404(self, id: int) -> tuple[Sessao, Decimal]:
        par = self.sessao_repo.buscar_por_id(id)
        if par is None:
            raise NaoEncontrado(f"Sessão {id} não encontrada")
        return par  # type: ignore[return-value]

    def listar(self, limite: int = 20, offset: int = 0) -> list[SessaoRead]:
        pares = self.sessao_repo.listar(limite, offset)
        return [_montar_read(sessao, volume) for sessao, volume in pares]

    def buscar(self, id: int) -> SessaoDetalhe:
        sessao, volume = self._buscar_ou_404(id)
        return _montar_detalhe(sessao, volume)

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
        # re-busca com relacionamentos carregados e volume (0 para sessão nova)
        sessao_nova, volume = self._buscar_ou_404(sessao.id)
        return _montar_read(sessao_nova, volume)

    def atualizar(self, id: int, dados: SessaoUpdate) -> SessaoRead:
        sessao, _ = self._buscar_ou_404(id)
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
        sessao_nova, volume = self._buscar_ou_404(id)
        return _montar_read(sessao_nova, volume)

    def remover(self, id: int) -> None:
        sessao, _ = self._buscar_ou_404(id)
        self.sessao_repo.remover(sessao)
