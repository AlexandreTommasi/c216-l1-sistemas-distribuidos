class NaoEncontrado(Exception):
    def __init__(self, mensagem: str = "Não encontrado") -> None:
        super().__init__(mensagem)


class Conflito(Exception):
    def __init__(self, mensagem: str) -> None:
        super().__init__(mensagem)
