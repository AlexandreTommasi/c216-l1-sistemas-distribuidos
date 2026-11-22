import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import ExerciciosPage from './pages/ExerciciosPage.jsx';
import HistoricoPage from './pages/HistoricoPage.jsx';
import NovaSessaoPage from './pages/NovaSessaoPage.jsx';
import SessaoPage from './pages/SessaoPage.jsx';
import TreinosPage from './pages/TreinosPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HistoricoPage />} />
          <Route path="/sessoes/nova" element={<NovaSessaoPage />} />
          <Route path="/sessoes/:id" element={<SessaoPage />} />
          <Route path="/exercicios" element={<ExerciciosPage />} />
          <Route path="/treinos" element={<TreinosPage />} />
        </Routes>
      </main>
    </div>
  );
}
