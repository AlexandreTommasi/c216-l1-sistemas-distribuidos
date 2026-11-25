import { Link } from 'react-router-dom';
import SessaoForm from '../components/SessaoForm.jsx';

export default function NovaSessaoPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Link to="/" className="text-sm text-zinc-500 hover:text-brand">
        ← Histórico
      </Link>
      <header className="mb-6 mt-3">
        <p className="text-xs uppercase tracking-[0.2em] text-brand">Hora de treinar</p>
        <h1 className="title-display mt-1 text-4xl font-semibold">Nova sessão</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Escolha o treino e o dia. Os exercícios da última vez já aparecem sugeridos.
        </p>
      </header>
      <div className="rounded-3xl border border-line bg-surface p-5">
        <SessaoForm />
      </div>
    </div>
  );
}
