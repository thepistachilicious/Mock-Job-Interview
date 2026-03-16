import axiosInstance, { saveTokens, clearTokens } from './axios';
import { AxiosError } from 'axios';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface UploadResponse {
    file_url: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
/** Pulls the error message out of a FastAPI error response */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.detail ?? error.message ?? 'Something went wrong';
  } 
    return 'Something went wrong';
};

// ─── Upload API calls ──────────────────────────────────────────────────────────
export const uploadService = {
    async uploadFile(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await axiosInstance.post<UploadResponse>('/api/v1/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    }
}