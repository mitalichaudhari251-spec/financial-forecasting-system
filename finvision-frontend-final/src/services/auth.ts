import { api } from './api';
import type { LoginRequest, RegisterRequest, AuthTokens, User } from '@/types/user';

export const authService = {
  login: (data: LoginRequest) =>
    api.post<{ user: User; tokens: AuthTokens }>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<{ user: User; tokens: AuthTokens }>('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    api.post<AuthTokens>('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  me: () => api.get<User>('/auth/me'),
};
