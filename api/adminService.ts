import axiosInstance from './axios';
import { AxiosError } from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserOverview {
  total_users: number;
  recent_signups: UserInformationResponse[];
  [key: string]: unknown;
}

export interface UserInformationResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  introduction: string | null;
  dateBirth: string | null;
  linkCV: string | null;
  linkGithub: string | null;
  linkLinkedin: string | null;
}

export interface CompanyResponse {
  id: string;
  name: string | null;
  introduction: string | null;
  requirement: string | null;
  culture: string | null;
  tech_stack: string | null;
  datecreated: string | null;
  dateupdated: string | null;
}

export interface CompanyCreateRequest {
  name: string | null;
  introduction?: string | null;
  requirement?: string | null;
  culture?: string | null;
  tech_stack?: string | null;
}

export interface CompanyUpdateRequest {
  name?: string | null;
  introduction?: string | null;
  requirement?: string | null;
  culture?: string | null;
  tech_stack?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.detail ?? error.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
};

// ─── Admin API Calls ──────────────────────────────────────────────────────────

export const adminService = {
  // ── User Routes ────────────────────────────────────────────────────────────

  /** GET /admin/users/overview — overview of all users */
  async getUserOverview(): Promise<UserOverview> {
    const { data } = await axiosInstance.get<UserOverview>('/api/v1/admin/users/overview');
    return data;
  },

  /** GET /admin/users/:id — details of a specific user */
  async getUserDetails(userId: string): Promise<UserInformationResponse> {
    const { data } = await axiosInstance.get<UserInformationResponse>(
      `/api/v1/admin/users/${userId}`
    );
    return data;
  },

  // ── Company Routes ─────────────────────────────────────────────────────────

  /** GET /admin/companies — list all companies */
  async listCompanies(): Promise<CompanyResponse[]> {
    const { data } = await axiosInstance.get('/api/v1/admin/companies');
    return data.companies ?? [];
  },

  /** GET /admin/companies/:id — details of a specific company */
  async getCompanyDetails(companyId: string): Promise<CompanyResponse> {
    const { data } = await axiosInstance.get<CompanyResponse>(
      `/api/v1/admin/companies/${companyId}`
    );
    return data;
  },

  /** POST /admin/companies — create a new company */
  async createCompany(payload: CompanyCreateRequest): Promise<CompanyResponse> {
    const { data } = await axiosInstance.post<CompanyResponse>(
      '/api/v1/admin/companies',
      payload
    );
    return data;
  },

  /** PUT /admin/companies/:id — update an existing company */
  async updateCompany(
    companyId: string,
    payload: CompanyUpdateRequest
  ): Promise<CompanyResponse> {
    const { data } = await axiosInstance.put<CompanyResponse>(
      `/api/v1/admin/companies/${companyId}`,
      payload
    );
    return data;
  },

  /** DELETE /admin/companies/:id — remove a company */
  async deleteCompany(companyId: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/admin/companies/${companyId}`);
  },
};