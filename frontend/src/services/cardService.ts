import api from './api';

export const cardService = {
  create: (boardId: string, data: { title: string; description?: string; columnId?: string }) =>
    api.post(`/boards/${boardId}/cards`, data),

  move: (boardId: string, cardId: string, targetColumnId: string) =>
    api.patch(`/boards/${boardId}/cards/${cardId}/move`, { targetColumnId }),

  update: (boardId: string, cardId: string, data: any) =>
    api.patch(`/boards/${boardId}/cards/${cardId}`, data),

  addComment: (boardId: string, cardId: string, text: string) =>
    api.post(`/boards/${boardId}/cards/${cardId}/comments`, { text }),
};
