export type UserRole = 'analyst' | 'quant' | 'trader' | 'ml_engineer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  createdAt: string;
  lastLogin: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultTimeframe: 'daily' | 'hourly' | 'weekly';
  defaultHorizon: '1d' | '7d' | '30d';
  confidenceThreshold: number;
  enableNotifications: boolean;
  enable3D: boolean;
  defaultRLAlgorithm: 'PPO' | 'DQN';
  timezone: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  organization?: string;
}
