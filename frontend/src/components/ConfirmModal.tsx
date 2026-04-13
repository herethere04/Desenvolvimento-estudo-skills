import { AlertTriangle } from 'lucide-react';

interface Props {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({ show, title, message, onConfirm, onCancel, loading }: Props) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <div className="glass-card p-8 w-full max-w-sm animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 mb-3">
            <AlertTriangle className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          <p className="text-sm text-gray-400 mt-2">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Movendo...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
