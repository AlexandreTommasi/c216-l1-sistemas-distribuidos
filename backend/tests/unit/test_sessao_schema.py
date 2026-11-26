import datetime

import pytest
from pydantic import ValidationError

from overload.schemas.sessao import SessaoCreate

pytestmark = pytest.mark.unit


def test_data_string_iso_passado_e_valida():
    ontem = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
    sessao = SessaoCreate(treino_id=1, data=ontem)
    assert isinstance(sessao.data, datetime.date)


def test_data_string_iso_futuro_levanta_validation_error():
    amanha = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
    with pytest.raises(ValidationError):
        SessaoCreate(treino_id=1, data=amanha)


def test_data_malformada_levanta_validation_error():
    with pytest.raises(ValidationError):
        SessaoCreate(treino_id=1, data="10/01/2024")
