import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { ArrowLeft, Copy } from 'lucide-react';
import { boardService } from '../services/boardService';
import { cardService } from '../services/cardService';
import type { BoardDetails, Card } from '../types';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import CreateCardModal from '../components/CreateCardModal';
import ConfirmModal from '../components/ConfirmModal';
import CardDetailModal from '../components/CardDetailModal';

// Strictly forward flow
const COLUMN_ORDER = ['Backlog', 'To-Do', 'In Progress', 'Done'];

function getNextColumnName(current: string): string | null {
  const idx = COLUMN_ORDER.indexOf(current);
  if (idx === -1 || idx === COLUMN_ORDER.length - 1) return null;
  return COLUMN_ORDER[idx + 1];
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<BoardDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingCardColumnId, setCreatingCardColumnId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeCardForDetails, setActiveCardForDetails] = useState<Card | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Confirm move state
  const [confirmMove, setConfirmMove] = useState<{
    card: Card;
    fromColumn: string;
    toColumn: string;
    targetColumnId: string;
  } | null>(null);
  const [moveLoading, setMoveLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchBoard = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await boardService.getById(id);
      setBoard(data);
    } catch {
      setError('Falha ao carregar o quadro.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const handleCreateCard = async (title: string, description?: string) => {
    if (!id || !creatingCardColumnId) return;
    try {
      await cardService.create(id, { title, description, columnId: creatingCardColumnId });
      setCreatingCardColumnId(null);
      fetchBoard();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar cartão.');
    }
  };

  const handleAdvanceCard = (card: Card, fromColumnName: string) => {
    if (!board) return;
    const nextName = getNextColumnName(fromColumnName);
    if (!nextName) return;

    const targetCol = board.columns.find((c) => c.name === nextName);
    if (!targetCol) return;

    setConfirmMove({
      card,
      fromColumn: fromColumnName,
      toColumn: nextName,
      targetColumnId: targetCol.id,
    });
  };

  const executeMove = async () => {
    if (!confirmMove || !id) return;
    setMoveLoading(true);
    try {
      await cardService.move(id, confirmMove.card.id, confirmMove.targetColumnId);
      setConfirmMove(null);
      fetchBoard();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Movimentação inválida.');
      setConfirmMove(null);
    } finally {
      setMoveLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id as string;
    for (const col of board?.columns || []) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) {
        setActiveCard(card);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || !board || !id) return;

    const cardId = active.id as string;
    const targetColumnId = over.id as string;

    // Find current column of the card
    let fromCol = null;
    let draggedCard = null;
    for (const col of board.columns) {
      const card = col.cards.find((c) => c.id === cardId);
      if (card) {
        fromCol = col;
        draggedCard = card;
        break;
      }
    }
    if (!fromCol || !draggedCard) return;

    const targetCol = board.columns.find((c) => c.id === targetColumnId);
    if (!targetCol || targetCol.id === fromCol.id) return;

    // Show confirmation
    setConfirmMove({
      card: draggedCard,
      fromColumn: fromCol.name,
      toColumn: targetCol.name,
      targetColumnId: targetCol.id,
    });
  };

  const copyInviteCode = () => {
    if (!board) return;
    navigator.clipboard.writeText(board.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-gray-400">
        Quadro não encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      {/* Header */}
      <header className="border-b border-dark-500/30 bg-dark-800/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="btn-ghost p-2 group">
              <ArrowLeft className="w-5 h-5 transition-colors text-gray-400 group-hover:text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-100">{board.name}</h1>
              {board.description && <p className="text-xs text-gray-500">{board.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyInviteCode}
              className="btn-ghost text-xs flex items-center gap-1.5 border border-dark-400/30 rounded-lg px-3 py-2 group"
              title="Copiar código de convite"
            >
              <Copy className="w-4 h-4 transition-colors text-gray-400 group-hover:text-white" />
              {copied ? 'Copiado!' : 'Código de Convite'}
            </button>
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-w-max h-full">
            {board.columns
              .sort((a, b) => a.position - b.position)
              .map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onAdvanceCard={(card) => handleAdvanceCard(card, column.name)}
                  onClickCard={(card) => setActiveCardForDetails(card)}
                  onAddCardClick={() => setCreatingCardColumnId(column.id)}
                />
              ))}
          </div>
          <DragOverlay>
            {activeCard && <KanbanCard card={activeCard} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {creatingCardColumnId && (
        <CreateCardModal onClose={() => setCreatingCardColumnId(null)} onConfirm={handleCreateCard} />
      )}

      {activeCardForDetails && board && (
        <CardDetailModal
          card={activeCardForDetails}
          board={board}
          onClose={() => setActiveCardForDetails(null)}
          onUpdate={fetchBoard}
        />
      )}

      <ConfirmModal
        show={!!confirmMove}
        title="Mover Cartão"
        message={
          confirmMove
            ? `Tem certeza que deseja mover "${confirmMove.card.title}" de "${confirmMove.fromColumn}" para "${confirmMove.toColumn}"?`
            : ''
        }
        onConfirm={executeMove}
        onCancel={() => setConfirmMove(null)}
        loading={moveLoading}
      />
    </div>
  );
}
