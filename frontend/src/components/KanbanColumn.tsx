import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import type { Column, Card } from '../types';
import KanbanCard from './KanbanCard';

interface Props {
  column: Column;
  onAdvanceCard: (card: Card) => void;
  onClickCard?: (card: Card) => void;
  onAddCardClick?: () => void;
}

const COLUMN_STYLES: Record<string, { border: string; glow: string; badge: string; dot: string }> = {
  'Backlog': {
    border: 'border-gray-600/30',
    glow: '',
    badge: 'bg-gray-600/20 text-gray-400',
    dot: 'bg-gray-500',
  },
  'To-Do': {
    border: 'border-amber-500/30',
    glow: '',
    badge: 'bg-amber-500/20 text-amber-400',
    dot: 'bg-amber-500',
  },
  'In Progress': {
    border: 'border-purple-500/30',
    glow: 'shadow-glow-purple/20',
    badge: 'bg-purple-500/20 text-purple-400',
    dot: 'bg-purple-500',
  },
  'Done': {
    border: 'border-emerald-500/30',
    glow: 'shadow-glow-green/20',
    badge: 'bg-emerald-500/20 text-emerald-400',
    dot: 'bg-emerald-500',
  },
};

export default function KanbanColumn({ column, onAdvanceCard, onClickCard, onAddCardClick }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: column.id });
  const styles = COLUMN_STYLES[column.name] || COLUMN_STYLES['Backlog'];

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex-shrink-0 rounded-2xl border transition-all duration-300
        ${styles.border} ${styles.glow}
        ${isOver ? 'border-brand-purple bg-brand-purple/5 scale-[1.01]' : 'bg-dark-800/40'}
      `}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-dark-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
            <h3 className="font-semibold text-gray-200 text-sm">{column.name}</h3>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
            {column.cards.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="p-3 space-y-2.5 min-h-[120px] max-h-[calc(100vh-260px)] overflow-y-auto">
        {column.cards.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-xs">
            {isOver ? 'Solte aqui' : 'Sem cartões'}
          </div>
        )}
        {column.cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            columnName={column.name}
            onAdvance={() => onAdvanceCard(card)}
            onClick={() => onClickCard && onClickCard(card)}
          />
        ))}
        {onAddCardClick && (
          <button
            onClick={onAddCardClick}
            className={`w-full py-2.5 mt-2 rounded-xl border border-dashed flex items-center justify-center gap-2 text-sm font-medium transition-all
              ${styles.border} text-gray-400 hover:text-gray-200 hover:bg-dark-600/30
            `}
          >
            <Plus className="w-4 h-4 transition-colors text-gray-400 group-hover/btn:text-white" />
            Adicionar Cartão
          </button>
        )}
      </div>
    </div>
  );
}
