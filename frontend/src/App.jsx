import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import ExercicioPage from './pages/ExercicioPage.jsx';
import ExerciciosPage from './pages/ExerciciosPage.jsx';
import HistoricoPage from './pages/HistoricoPage.jsx';
import NovaSessaoPage from './pages/NovaSessaoPage.jsx';
import SessaoPage from './pages/SessaoPage.jsx';
import TreinosPage from './pages/TreinosPage.jsx';

export default function App() {
  return (
    <div className="grain min-h-screen bg-ink text-zinc-100">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HistoricoPage />} />
          <Route path="/sessoes/nova" element={<NovaSessaoPage />} />
          <Route path="/sessoes/:id" element={<SessaoPage />} />
          <Route path="/exercicios" element={<ExerciciosPage />} />
          <Route path="/exercicios/:id" element={<ExercicioPage />} />
          <Route path="/treinos" element={<TreinosPage />} />
        </Routes>
      </main>
    </div>
  );
}
