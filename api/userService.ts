import axiosInstance, { saveTokens, clearTokens } from './axios';
import { AxiosError } from 'axios';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface UserInformation {
    id: string;
    email: string;
    role: string;
    introduction: string | null;
    dateBirth: string | null;
    linkCV: string | null;
    linkGithub: string | null;
    linkLinkedin: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Pulls the error message out of a FastAPI error response */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.detail ?? error.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
};

// ─── User API calls ──────────────────────────────────────────────────────────
export const userService = {
    async getUserInfo(): Promise<UserInformation> {
        console.log('Fetching user information from API...');
        const { data } = await axiosInstance.get<UserInformation>('/api/v1/users/me');
        return data;
    },
    async updateUserInfo(userInfo: Partial<UserInformation>): Promise<UserInformation> {
        const { data } = await axiosInstance.put<UserInformation>('/api/v1/users/update', userInfo);
        return data;
    }
};