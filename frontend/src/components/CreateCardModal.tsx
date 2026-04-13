import { useState } from 'react';

interface Props {
  onClose: () => void;
  onConfirm: (title: string, description?: string) => void;
}

export default function CreateCardModal({ onClose, onConfirm }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(title, description || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="glass-card p-8 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-100 mb-6">Novo Cartão</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Título</label>
            <input
              id="card-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full"
              placeholder="O que precisa ser feito?"
              required
              maxLength={200}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Descrição (opcional)</label>
            <textarea
              id="card-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full resize-none h-24"
              placeholder="Detalhes adicionais..."
              maxLength={1000}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button id="create-card-submit" type="submit" className="btn-primary flex-1">Criar Cartão</button>
          </div>
        </form>
      </div>
    </div>
  );
}
