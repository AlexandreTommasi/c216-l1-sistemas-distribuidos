import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo.jsx';

const LINKS = [
  { to: '/', label: 'Histórico' },
  { to: '/exercicios', label: 'Exercícios' },
  { to: '/treinos', label: 'Treinos' },
];

export default function NavBar() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky top-0 z-20 border-b border-line bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <Link to="/" className="mr-auto flex items-center gap-2.5">
          <Logo className="h-7 w-7" />
          <span className="title-display text-xl font-semibold text-zinc-100">
            Over<span className="text-brand">load</span>
          </span>
        </Link>
        {LINKS.map(({ to, label }) => {
          const ativo = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-current={ativo ? 'page' : undefined}
              className={`relative py-1 text-sm font-medium transition-colors ${
                ativo ? 'text-brand' : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {label}
              {ativo && (
                <span className="absolute -bottom-[13px] left-0 right-0 h-0.5 rounded-full bg-brand" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
