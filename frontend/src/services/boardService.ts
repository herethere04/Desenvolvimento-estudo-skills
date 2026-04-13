import api from './api';
import type { Board, BoardDetails, Tag } from '../types';

export const boardService = {
  list: () => api.get<Board[]>('/boards'),

  getById: (id: string) => api.get<BoardDetails>(`/boards/${id}`),

  create: (data: { name: string; description?: string }) =>
    api.post<{ id: string; name: string; inviteCode: string }>('/boards', data),

  join: (inviteCode: string) =>
    api.post<{ boardId: string; name: string }>('/boards/join', { inviteCode }),

  getTags: (boardId: string) => api.get<Tag[]>(`/boards/${boardId}/tags`),

  createTag: (boardId: string, data: { name: string; color: string }) =>
    api.post<Tag>(`/boards/${boardId}/tags`, data),
};
