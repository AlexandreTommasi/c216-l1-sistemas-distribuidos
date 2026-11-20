class NaoEncontrado(Exception):
    pass


class Conflito(Exception):
    def __init__(self, mensagem: str) -> None:
        super().__init__(mensagem)
