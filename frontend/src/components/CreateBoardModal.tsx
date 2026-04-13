import { useState } from 'react';
import { boardService } from '../services/boardService';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateBoardModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await boardService.create({ name, description: description || undefined });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar quadro.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card p-8 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-100 mb-6">Novo Quadro</h2>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Nome do Quadro</label>
            <input
              id="board-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full"
              placeholder="Ex: Sprint 2026-Q2"
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Descrição (opcional)</label>
            <textarea
              id="board-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full resize-none h-24"
              placeholder="Descreva o objetivo do quadro..."
              maxLength={500}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button id="create-board-submit" type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Criando...' : 'Criar Quadro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
