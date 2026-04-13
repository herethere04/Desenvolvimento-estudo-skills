import { useDraggable } from '@dnd-kit/core';
import { Clock, MessageSquare } from 'lucide-react';
import type { Card } from '../types';

interface Props {
  card: Card;
  columnName?: string;
  onAdvance?: () => void;
  onClick?: () => void;
  isDragging?: boolean;
}

const NEXT_LABELS: Record<string, string> = {
  'Backlog': 'Mover → To-Do',
  'To-Do': 'Mover → In Progress',
  'In Progress': 'Mover → Done',
};

export default function KanbanCard({ card, columnName, onAdvance, onClick, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: card.id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const nextLabel = columnName ? NEXT_LABELS[columnName] : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`group bg-dark-700/80 border border-dark-500/30 rounded-xl p-3.5 cursor-grab
        hover:border-brand-purple/30 hover:bg-dark-600/60 transition-all duration-200 block w-full text-left
        ${isDragging ? 'opacity-80 shadow-glow-purple rotate-2 scale-105' : ''}
        active:cursor-grabbing
      `}
    >
      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: tag.color.startsWith('bg-') ? undefined : `${tag.color}30`,
                color: tag.color.startsWith('bg-') ? undefined : tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <h4 className="text-sm font-medium text-gray-200 mb-1 leading-tight">{card.title}</h4>
      
      {card.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{card.description}</p>
      )}
      
      {/* Footer Info (Due date, Comments count, Assignees) */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          {/* Due Date */}
          {card.dueDate && (
            <div
              className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded ${
                new Date(card.dueDate) < new Date()
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-brand-purple/10 text-brand-purple-light border border-brand-purple/20'
              }`}
            >
              <Clock className="w-3 h-3 transition-colors text-current" />
              {new Date(card.dueDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
            </div>
          )}

          {/* Activities Count */}
          {card._count && card._count.activities > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <MessageSquare className="w-3.5 h-3.5 transition-colors text-gray-400 group-hover:text-white" />
              {card._count.activities}
            </div>
          )}
        </div>

        {/* Info Direita (Avatares, Avançar) */}
        <div className="flex items-center gap-2">
          {/* Members Avatars */}
          {card.assignedMembers && card.assignedMembers.length > 0 && (
            <div className="flex items-center -space-x-1.5">
              {card.assignedMembers.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-5 h-5 rounded-full bg-brand-purple flex items-center justify-center text-[9px] font-bold text-white border border-dark-600 outline-none select-none"
                  title={member.name}
                >
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
              ))}
              {card.assignedMembers.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-dark-500 flex items-center justify-center text-[9px] font-bold text-gray-300 border border-dark-600">
                  +{card.assignedMembers.length - 3}
                </div>
              )}
            </div>
          )}

          {nextLabel && onAdvance && (
            <button
              onClick={(e) => { e.stopPropagation(); onAdvance(); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 text-[10px] text-brand-purple hover:text-white
                        bg-brand-purple/10 hover:bg-brand-purple border border-brand-purple/30 px-2.5 py-1 rounded-md transition-all duration-200 font-medium whitespace-nowrap shadow-sm shadow-black/20"
            >
              {nextLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
