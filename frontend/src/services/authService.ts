import api from './api';
import type { AuthResponse } from '../types';

export const authService = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post<{ id: string; email: string; name: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};
