from overload.models.exercicio import Exercicio, GrupoMuscular
from overload.repositories.exercicio import ExercicioRepository
from overload.schemas.exercicio import ExercicioCreate, ExercicioUpdate
from overload.services.errors import Conflito, NaoEncontrado


class ExercicioService:
    def __init__(self, repo: ExercicioRepository) -> None:
        self.repo = repo

    def listar(self, grupo: GrupoMuscular | None = None) -> list[Exercicio]:
        return self.repo.listar(grupo)

    def buscar(self, id: int) -> Exercicio:
        exercicio = self.repo.buscar_por_id(id)
        if exercicio is None:
            raise NaoEncontrado(f"Exercício {id} não encontrado")
        return exercicio

    def criar(self, dados: ExercicioCreate) -> Exercicio:
        nome_normalizado = dados.nome.strip().lower()
        if self.repo.buscar_por_nome_normalizado(nome_normalizado) is not None:
            raise Conflito(f"Já existe um exercício com o nome '{dados.nome.strip()}'")
        return self.repo.criar(dados)

    def atualizar(self, id: int, dados: ExercicioUpdate) -> Exercicio:
        exercicio = self.buscar(id)
        if dados.nome is not None:
            nome_normalizado = dados.nome.strip().lower()
            existente = self.repo.buscar_por_nome_normalizado(nome_normalizado)
            if existente is not None and existente.id != id:
                raise Conflito(
                    f"Já existe um exercício com o nome '{dados.nome.strip()}'"
                )
        return self.repo.atualizar(exercicio, dados)

    def remover(self, id: int) -> None:
        exercicio = self.buscar(id)
        total = self.repo.contar_series(id)
        if total > 0:
            raise Conflito(f"Exercício possui {total} série(s) e não pode ser removido")
        self.repo.remover(exercicio)
