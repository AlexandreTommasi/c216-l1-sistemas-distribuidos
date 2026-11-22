import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SessaoList from '../components/SessaoList.jsx';
import { listarSessoes } from '../services/sessoes.js';

export default function HistoricoPage() {
  const [sessoes, setSessoes] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await listarSessoes();
      setSessoes(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Histórico</h1>
        <Link
          to="/sessoes/nova"
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Nova sessão
        </Link>
      </div>

      {carregando && <p className="text-zinc-400">Carregando...</p>}

      {erro && (
        <div role="alert" className="bg-red-900/40 border border-red-700 rounded-lg p-4 mb-4">
          <p className="text-red-300 mb-2">{erro}</p>
          <button type="button" onClick={carregar} className="text-sm text-red-300 underline">
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && !erro && sessoes !== null && <SessaoList sessoes={sessoes} />}
    </div>
  );
}
