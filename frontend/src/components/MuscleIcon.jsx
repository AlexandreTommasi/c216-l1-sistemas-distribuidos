import { grupo } from '../lib/grupos.js';

const TRACOS = {
  peito: 'M4 8c3-2 5 0 8 0s5-2 8 0M4 8v4c0 3 3 4 8 4s8-1 8-4V8',
  costas: 'M12 4v16M12 6l-7 4 2 7M12 6l7 4-2 7',
  pernas: 'M9 4v6l-3 6 3 4M15 4v6l3 6-3 4',
  ombros: 'M12 7a4 4 0 0 1 4 4M12 7a4 4 0 0 0-4 4M4 18c0-5 3.5-8 8-8s8 3 8 8',
  biceps: 'M6 18V9a4 4 0 0 1 8 0c3 0 5 2 5 5s-3 4-5 4',
  triceps: 'M8 5v6a4 4 0 0 0 8 0V5M6 19h12',
  abdomen: 'M9 5h6M9 10h6M9 15h6M12 4v16',
  panturrilha: 'M10 4c0 4-3 5-3 9a5 5 0 0 0 10 0c0-4-3-5-3-9',
};

export default function MuscleIcon({ chave, className = 'w-5 h-5' }) {
  const { rotulo } = grupo(chave);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={rotulo}
    >
      <path d={TRACOS[chave] ?? 'M12 4v16M4 12h16'} />
    </svg>
  );
}
