import { useState } from 'react';
import { boardService } from '../services/boardService';

interface Props {
  onClose: () => void;
  onJoined: () => void;
}

export default function JoinBoardModal({ onClose, onJoined }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await boardService.join(code.trim());
      onJoined();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código inválido.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card p-8 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-100 mb-2">Entrar em um Quadro</h2>
        <p className="text-sm text-gray-500 mb-6">Insira o código de convite fornecido pelo administrador.</p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            id="join-code-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="glass-input w-full font-mono"
            placeholder="Cole o código de convite aqui"
            required
          />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button id="join-board-submit" type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
