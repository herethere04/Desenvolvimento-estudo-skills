import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { boardService } from '../services/boardService';
import type { Board } from '../types';
import CreateBoardModal from '../components/CreateBoardModal';
import JoinBoardModal from '../components/JoinBoardModal';
import { LayoutDashboard, Plus, LogIn, Users } from 'lucide-react';

export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const fetchBoards = async () => {
    try {
      const { data } = await boardService.list();
      setBoards(data);
    } catch {
      console.error('Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoards(); }, []);

  const getRoleLabel = (role: string) =>
    role === 'admin' ? 'Admin' : 'Membro';

  const getRoleBadgeClass = (role: string) =>
    role === 'admin'
      ? 'bg-brand-purple/20 text-brand-purple-light border-brand-purple/30'
      : 'bg-dark-500/50 text-gray-400 border-dark-400/30';

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-dark-500/30 bg-dark-800/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center shadow-glow-purple">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-100">Kanban Ágil</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
            </div>
            <button onClick={logout} className="btn-ghost text-sm">
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button id="create-board-btn" onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5 transition-colors text-gray-400 hover:text-white" />
            Novo Quadro
          </button>
          <button id="join-board-btn" onClick={() => setShowJoin(true)} className="btn-secondary flex items-center gap-2">
            <LogIn className="w-5 h-5 transition-colors text-gray-400 hover:text-white" />
            Entrar com Código
          </button>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Seus Quadros</h2>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && boards.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-dark-700/50 mb-4">
              <LayoutDashboard className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-400">Nenhum quadro ainda</h3>
            <p className="text-gray-600 mt-1">Crie um novo quadro ou entre com um código de convite.</p>
          </div>
        )}

        {/* Board Grid */}
        {!loading && boards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board, i) => (
              <button
                key={board.id}
                id={`board-${board.id}`}
                onClick={() => navigate(`/board/${board.id}`)}
                className="glass-card p-6 text-left hover:border-brand-purple/40 hover:shadow-glow-purple/30
                           transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-100 group-hover:text-brand-purple-light transition-colors">
                    {board.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getRoleBadgeClass(board.role)}`}>
                    {getRoleLabel(board.role)}
                  </span>
                </div>
                {board.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{board.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 transition-colors text-gray-400 hover:text-white" />
                    {board.memberCount} {board.memberCount === 1 ? 'membro' : 'membros'}
                  </span>
                  <span>
                    {new Date(board.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {showCreate && <CreateBoardModal onClose={() => setShowCreate(false)} onCreated={fetchBoards} />}
      {showJoin && <JoinBoardModal onClose={() => setShowJoin(false)} onJoined={fetchBoards} />}
    </div>
  );
}
