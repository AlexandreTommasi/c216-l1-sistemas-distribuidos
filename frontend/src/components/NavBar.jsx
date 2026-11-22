import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Histórico' },
  { to: '/exercicios', label: 'Exercícios' },
  { to: '/treinos', label: 'Treinos' },
];

export default function NavBar() {
  const { pathname } = useLocation();
  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-6">
      <span className="text-emerald-400 font-bold text-lg mr-auto">Overload</span>
      {LINKS.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={`text-sm font-medium transition-colors ${
            pathname === to ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
