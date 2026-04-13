import { useState, useEffect } from 'react';
import { AlignLeft, X, MessageSquare, User, Check, Tag as TagIcon, Calendar, CheckSquare, Paperclip, Plus } from 'lucide-react';
import type { Card, BoardDetails } from '../types';
import { cardService } from '../services/cardService';
import { boardService } from '../services/boardService';

const TAG_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', 
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B'
];

interface Props {
  card: Card;
  board: BoardDetails;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CardDetailModal({ card, board, onClose, onUpdate }: Props) {
  const [description, setDescription] = useState(card.description || '');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [loadingDesc, setLoadingDesc] = useState(false);
  
  const [commentText, setCommentText] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  const [activePopover, setActivePopover] = useState<'members' | 'tags' | 'date' | null>(null);

  const [localTags, setLocalTags] = useState(card.tags || []);
  const [localMembers, setLocalMembers] = useState(card.assignedMembers || []);
  const [localDueDate, setLocalDueDate] = useState<string | null>(card.dueDate || null);

  useEffect(() => { setLocalTags(card.tags || []); }, [card.tags]);
  useEffect(() => { setLocalMembers(card.assignedMembers || []); }, [card.assignedMembers]);
  useEffect(() => { setLocalDueDate(card.dueDate || null); }, [card.dueDate]);

  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [loadingTagCreate, setLoadingTagCreate] = useState(false);

  const handleUpdateBase = async (payload: any) => {
    try {
      await cardService.update(board.id, card.id, payload);
      onUpdate();
    } catch (err) {
      alert('Erro ao atualizar o cartão.');
    }
  };

  const handleSaveDescription = async () => {
    setLoadingDesc(true);
    await handleUpdateBase({ description });
    setIsEditingDesc(false);
    setLoadingDesc(false);
  };

  const handleToggleMember = async (memberId: string, isAssigned: boolean) => {
    const member = board.members.find(m => m.user.id === memberId)?.user;
    if (!member) return;
    setLocalMembers(prev => isAssigned ? prev.filter(m => m.id !== memberId) : [...prev, member]);
    try {
      await handleUpdateBase(isAssigned ? { removeMemberId: memberId } : { addMemberId: memberId });
    } catch {
      setLocalMembers(card.assignedMembers || []);
    }
  };

  const handleToggleTag = async (tagId: string, isAssigned: boolean, tagFromCreate?: any) => {
    const tag = tagFromCreate || board.tags.find(t => t.id === tagId);
    if (!tag) return;
    setLocalTags(prev => isAssigned ? prev.filter(t => t.id !== tagId) : [...prev, tag]);
    try {
      await handleUpdateBase(isAssigned ? { removeTagId: tagId } : { addTagId: tagId });
    } catch {
      setLocalTags(card.tags || []);
    }
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? new Date(e.target.value).toISOString() : null;
    setLocalDueDate(val);
    try {
      await handleUpdateBase({ dueDate: val });
    } catch {
      setLocalDueDate(card.dueDate || null);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setLoadingComment(true);
    try {
      await cardService.addComment(board.id, card.id, commentText);
      setCommentText('');
      onUpdate();
    } catch {
      alert('Erro ao postar comentário.');
    } finally {
      setLoadingComment(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setLoadingTagCreate(true);
    try {
      const { data: createdTag } = await boardService.createTag(board.id, { name: newTagName, color: newTagColor });
      await handleToggleTag(createdTag.id, false, createdTag); // pass the new tag directly
      setNewTagName('');
      setIsCreatingTag(false);
    } catch {
      alert('Erro ao criar etiqueta.');
    } finally {
      setLoadingTagCreate(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-dark-500/30 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col relative animate-slide-up overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-dark-600/50 bg-dark-800/80">
          <div className="flex items-start gap-4">
            <AlignLeft className="w-6 h-6 text-brand-purple mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-100 mb-1">{card.title}</h2>
              <p className="text-sm text-gray-500">
                Na coluna <span className="font-semibold text-gray-300 underline underline-offset-2">
                  {board.columns.find(c => c.cards.some(cm => cm.id === card.id))?.name || 'Desconhecida'}
                </span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-dark-600 transition-colors group">
            <X className="w-5 h-5 transition-colors text-gray-400 group-hover:text-white" />
          </button>
        </div>

        {/* Body Layout */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row gap-6 p-6">
          
          {/* Main Left Area */}
          <div className="flex-1 space-y-8">
                       {/* Tags, Members and Date row */}
            <div className="flex flex-wrap gap-8 pb-2 min-h-[76px]">
              
              {/* Etiquetas */}
              {localTags && localTags.length > 0 && (
                <div className="min-w-[120px] animate-fade-in">
                  <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Etiquetas</h3>
                  <div className="flex flex-wrap gap-2">
                    {localTags.map(t => (
                      <span key={t.id} className="text-xs px-3 py-1 rounded font-medium" style={{ backgroundColor: `${t.color}30`, color: t.color }}>
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Membros */}
              {localMembers && localMembers.length > 0 && (
                <div className="min-w-[120px] animate-fade-in">
                  <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Membros</h3>
                  <div className="flex flex-wrap gap-2">
                    {localMembers.map(m => (
                      <div key={m.id} className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-xs font-bold text-white border-2 border-dark-800" title={m.name}>
                        {m.name.substring(0, 2).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data de Entrega */}
              {localDueDate && (
                <div className="min-w-[120px] animate-fade-in">
                   <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Data de Entrega</h3>
                   <div className={`inline-flex text-sm px-3 py-1.5 rounded-md font-medium border ${new Date(localDueDate) < new Date() ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-dark-600/50 text-gray-300 border-dark-500/40'}`}>
                     {new Date(localDueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                   </div>
                </div>
              )}

            </div>

            {/* Description */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <AlignLeft className="w-5 h-5 text-gray-400" />
                <h3 className="text-base font-semibold text-gray-200">Descrição</h3>
                {!isEditingDesc && (
                  <button onClick={() => setIsEditingDesc(true)} className="ml-auto text-sm text-brand-purple bg-brand-purple/10 hover:bg-brand-purple/20 px-3 py-1 rounded-md transition-colors">
                    Editar
                  </button>
                )}
              </div>
              
              {isEditingDesc ? (
                <div className="space-y-3">
                  <textarea
                    autoFocus
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Adicione uma descrição mais detalhada..."
                    className="w-full h-32 bg-dark-900 border border-dark-600 rounded-xl p-3 text-sm text-gray-100 placeholder-gray-600 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none resize-none transition-all"
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={handleSaveDescription} disabled={loadingDesc} className="btn-primary text-sm px-4 py-1.5">
                      {loadingDesc ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button onClick={() => { setIsEditingDesc(false); setDescription(card.description || ''); }} className="btn-ghost text-sm px-4 py-1.5 text-gray-400 hover:text-white">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingDesc(true)}
                  className={`text-sm text-gray-400 w-full min-h-[80px] p-4 rounded-xl cursor-pointer hover:bg-dark-600/30 transition-colors ${!card.description ? 'bg-dark-600/20' : ''}`}
                >
                  {card.description ? card.description.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>) : 'Adicionar uma descrição detalhada...'}
                </div>
              )}
            </div>

            {/* Activity Stream */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <h3 className="text-base font-semibold text-gray-200">Atividade</h3>
              </div>
              
              <div className="flex gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-dark-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-400">Tu</div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="w-full min-h-[40px] h-[40px] focus:h-[80px] bg-dark-900 border border-dark-600 rounded-xl p-3 text-sm text-gray-100 placeholder-gray-600 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none resize-none transition-all"
                  />
                  {commentText && (
                    <button onClick={handleAddComment} disabled={loadingComment} className="mt-2 btn-primary text-sm py-1.5">
                      Salvar
                    </button>
                  )}
                </div>
              </div>

              {/* Feed de Comentários Anteriores */}
              {card.activities && card.activities.length > 0 && (
                <div className="space-y-4">
                  {card.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-dark-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-300 border border-dark-500">
                        {activity.user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-dark-800/50 border border-dark-600 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-200">{activity.user.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{activity.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Actions */}
          <div className="w-full md:w-48 flex-shrink-0 flex flex-col gap-2 relative">
            <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Adicionar ao cartão</h3>
            
            {/* Members action */}
            <div className="relative">
              <button onClick={() => setActivePopover(activePopover === 'members' ? null : 'members')} className="w-full flex items-center gap-2 bg-dark-600/40 hover:bg-dark-600/80 px-3 py-2 rounded-lg text-sm text-gray-300 font-medium transition-colors group">
                <User className="w-4 h-4 transition-colors text-brand-purple group-hover:text-white" />
                Membros
              </button>
              {activePopover === 'members' && (
                <div className="absolute right-0 sm:right-0 sm:left-auto top-full mt-1 w-64 bg-dark-800 border border-dark-500 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="p-3 border-b border-dark-600 bg-dark-700/50 flex items-center justify-between">
                     <span className="text-xs font-semibold text-gray-300">Membros do Quadro</span>
                     <button onClick={(e) => { e.stopPropagation(); setActivePopover(null); }} className="text-gray-400 hover:text-white transition-colors p-1">
                       <X className="w-3.5 h-3.5" />
                     </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                    {board.members.map(bm => {
                      const isAssigned = localMembers.some(m => m.id === bm.user.id);
                      return (
                        <div key={bm.id} onClick={() => handleToggleMember(bm.user.id, !!isAssigned)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${isAssigned ? 'bg-dark-600/80 border-dark-500/50 shadow-inner shadow-black/20 text-gray-100' : 'hover:bg-dark-600/30 border-transparent text-gray-400'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border ${isAssigned ? 'bg-brand-purple border-brand-purple-light' : 'bg-dark-500 border-dark-400'}`}>
                            {bm.user.name.substring(0,2).toUpperCase()}
                          </div>
                          <span className="text-sm flex-1 font-medium">{bm.user.name}</span>
                          {isAssigned && <Check className="w-4 h-4 text-brand-purple-light" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tags Action */}
            <div className="relative">
              <button onClick={() => { setActivePopover(activePopover === 'tags' ? null : 'tags'); setIsCreatingTag(false); }} className="w-full flex items-center gap-2 bg-dark-600/40 hover:bg-dark-600/80 px-3 py-2 rounded-lg text-sm text-gray-300 font-medium transition-colors group">
                <TagIcon className="w-4 h-4 transition-colors text-brand-purple group-hover:text-white" />
                Etiquetas
              </button>
              {activePopover === 'tags' && (
                <div className="absolute right-0 sm:right-0 sm:left-auto top-full mt-1 w-64 bg-dark-800 border border-dark-500 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="p-3 border-b border-dark-600 bg-dark-700/50 flex align-center justify-between">
                     <span className="text-xs font-semibold text-gray-300">Etiquetas</span>
                     <div className="flex items-center gap-2">
                       {!isCreatingTag && (
                         <button onClick={() => setIsCreatingTag(true)} className="flex items-center gap-1 text-[10px] uppercase font-bold text-brand-purple hover:text-white bg-brand-purple/10 hover:bg-brand-purple px-2 py-1 rounded transition-colors">
                           <Plus className="w-3 h-3" />
                           Nova
                         </button>
                       )}
                       <button onClick={(e) => { e.stopPropagation(); setActivePopover(null); }} className="text-gray-400 hover:text-white transition-colors p-1">
                         <X className="w-3.5 h-3.5" />
                       </button>
                     </div>
                  </div>
                  {isCreatingTag ? (
                    <div className="p-3">
                      <input 
                        type="text" 
                        value={newTagName} 
                        onChange={e => setNewTagName(e.target.value)} 
                        placeholder="Nome da etiqueta" 
                        className="w-full bg-dark-900 border border-dark-600 rounded p-2 text-xs text-gray-100 mb-3"
                      />
                      <div className="flex flex-wrap gap-2 mb-3">
                        {TAG_COLORS.map(color => (
                          <div 
                            key={color} 
                            onClick={() => setNewTagColor(color)} 
                            className={`w-6 h-6 rounded cursor-pointer border-2 ${newTagColor === color ? 'border-white' : 'border-transparent'}`} 
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={handleCreateTag} disabled={loadingTagCreate} className="btn-primary text-xs py-1 flex-1">Criar</button>
                        <button onClick={() => setIsCreatingTag(false)} className="btn-ghost text-xs py-1 flex-1">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto p-2 space-y-1.5">
                      {board.tags.map(t => {
                        const isAssigned = localTags.some(ct => ct.id === t.id);
                        return (
                          <div key={t.id} onClick={() => handleToggleTag(t.id, !!isAssigned)} className={`flex items-center gap-3 p-1.5 rounded-lg cursor-pointer transition-all border ${isAssigned ? 'bg-dark-600/60 border-dark-500/50 shadow-inner shadow-black/20' : 'hover:bg-dark-600/30 border-transparent'}`}>
                            <div className="w-full flex items-center gap-2">
                              <span className="flex-1 text-xs px-3 py-1.5 rounded-md font-bold truncate border transition-colors duration-200" style={{ backgroundColor: isAssigned ? t.color : `${t.color}15`, color: isAssigned ? '#fff' : t.color, borderColor: isAssigned ? 'rgba(0,0,0,0.2)' : `${t.color}40`, textShadow: isAssigned ? '0 1px 2px rgba(0,0,0,0.3)' : 'none' }}>{t.name}</span>
                              <div className="w-5 flex justify-end">
                                {isAssigned && <Check className="w-4 h-4 text-gray-300" />}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {board.tags.length === 0 && (
                        <div className="text-xs text-gray-500 p-2 text-center">Nenhuma etiqueta.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date Action */}
            <div className="relative">
              <button onClick={() => setActivePopover(activePopover === 'date' ? null : 'date')} className="w-full flex items-center gap-2 bg-dark-600/40 hover:bg-dark-600/80 px-3 py-2 rounded-lg text-sm text-gray-300 font-medium transition-colors group">
                <Calendar className="w-4 h-4 transition-colors text-brand-purple group-hover:text-white" />
                Datas
              </button>
              {activePopover === 'date' && (
                <div className="absolute right-0 sm:right-0 sm:left-auto top-full mt-1 w-64 bg-dark-800 border border-dark-500 rounded-xl shadow-xl z-20 overflow-hidden p-4">
                  <div className="mb-2 flex items-center justify-between">
                     <span className="text-xs font-semibold text-gray-300">Definir data de entrega</span>
                     <button onClick={(e) => { e.stopPropagation(); setActivePopover(null); }} className="text-gray-400 hover:text-white transition-colors p-1 -mr-1">
                       <X className="w-3.5 h-3.5" />
                     </button>
                  </div>
                  <input
                    type="date"
                    value={localDueDate ? localDueDate.split('T')[0] : ''}
                    onChange={handleDateChange}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg p-2 text-sm text-gray-100 placeholder-gray-500 focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-colors [color-scheme:dark]"
                  />
                  {localDueDate && (
                     <button onClick={async () => {
                       setLocalDueDate(null);
                       try { await handleUpdateBase({ dueDate: null }); }
                       catch { setLocalDueDate(card.dueDate || null); }
                     }} className="w-full mt-3 btn-ghost border border-red-500/20 text-red-400 hover:bg-red-500/10 py-1.5 text-xs">
                       Remover Data
                     </button>
                  )}
                </div>
              )}
            </div>

            {/* Placeholders */}
            <button disabled className="w-full flex items-center gap-2 bg-dark-600/20 px-3 py-2 rounded-lg text-sm text-gray-600 font-medium cursor-not-allowed group">
              <CheckSquare className="w-4 h-4 text-brand-purple/50 transition-colors group-hover:text-brand-purple/70" />
              Checklist (Em breve)
            </button>
            <button disabled className="w-full flex items-center gap-2 bg-dark-600/20 px-3 py-2 rounded-lg text-sm text-gray-600 font-medium cursor-not-allowed group">
              <Paperclip className="w-4 h-4 text-brand-purple/50 transition-colors group-hover:text-brand-purple/70" />
              Anexos (Em breve)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
