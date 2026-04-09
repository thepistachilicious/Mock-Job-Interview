import axiosInstance, { saveTokens, clearTokens } from './axios';
import { AxiosError } from 'axios';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Pulls the error message out of a FastAPI error response */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.detail ?? error.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
};

// ─── Auth API calls ──────────────────────────────────────────────────────────

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const { data } = await axiosInstance.post<AuthUser>('/api/v1/auth/register', payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await axiosInstance.post<AuthTokens>('/api/v1/auth/login', payload);
    saveTokens(data.access_token, data.refresh_token);
    return data;
  },

  async logout(): Promise<void> {
    const access_token = localStorage.getItem('access_token');
    if (access_token) {
      try {
        await axiosInstance.post('/api/v1/auth/logout', { access_token });
      } catch {
        // ignore — clear tokens regardless
      }
    }
    clearTokens();
  },

  async me(): Promise<AuthUser> {
    const { data } = await axiosInstance.get<AuthUser>('/api/v1/auth/me');
    return data;
  },
};