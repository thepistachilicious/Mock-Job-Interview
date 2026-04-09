import axiosInstance from './axios';
import { AxiosError } from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StartInterviewRequest {
  cv_text: string;
  job_position: string;
  job_description: string;
  company_description: string;
}

export interface StartInterviewResponse {
  session_id: string;
  status: 'preprocessing';
  message: string;
}

export type InterviewStatus = 'preprocessing' | 'in_progress' | 'completed' | string;

export interface ConversationEntry {
  [key: string]: unknown;
}

export interface InterviewStatusResponse {
  session_id: string;
  status: InterviewStatus;
  question_count: number;
  current_section: 'tech' | 'project' | 'cultural' | string;
  conversation: ConversationEntry[];
}

export interface TechnicalSkills {
  oop: number;
  algorithms: number;
  networking: number;
  system_design: number;
  technology_stack: number;
  average: number;
}

export interface ProjectExperience {
  project_complexity: number;
  role_in_project: number;
  problem_solving: number;
  average: number;
}

export interface CulturalFit {
  company_culture_fit: number;
  teamwork: number;
  communication: number;
  average: number;
}

export interface InterviewEvaluationResponse {
  session_id: string;
  candidate_name: string;
  job_position: string;
  technical_skills: TechnicalSkills;
  project_experience: ProjectExperience;
  cultural_fit: CulturalFit;
  overall_match_score: number;
  recommendation: string;
  strengths: string[];
  areas_for_improvement: string[];
  summary: string;
}
export interface InterviewerResponse {
  id: string;
  sessionId: string;
  order: number;
  text: string;
  dateCreated: string;
}

export interface CandidateAnswerCreated {
  sessionId: string;
  order: number;
  text: string;
  comment: string | null;
  dateCreated: string;
}

export interface InterviewHistory {
  interviewer: InterviewerResponse[] | null;
  candidate: CandidateAnswerCreated[] | null;
}
// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.detail ?? error.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
};

// ─── Interview Service ────────────────────────────────────────────────────────

export const interviewService = {
  /**
   * POST /api/v1/interview/start
   * Start a new interview session with CV and job info.
   */
  async startInterview(payload: StartInterviewRequest): Promise<StartInterviewResponse> {
    const formData = new URLSearchParams();
    formData.append('cv_text', payload.cv_text);
    formData.append('job_position', payload.job_position);
    formData.append('job_description', payload.job_description);
    formData.append('company_description', payload.company_description);

    const { data } = await axiosInstance.post<StartInterviewResponse>(
      '/api/v1/interview/start',
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return data;
  },

  /**
   * POST /api/v1/interview/{session_id}/question
   * Submit an answer and receive the next question.
   */
  async nextQuestion(sessionId: string, answer: string): Promise<unknown> {
    const formData = new URLSearchParams();
    formData.append('answer', answer);

    const { data } = await axiosInstance.post(
      `/api/v1/interview/${sessionId}/question`,
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return data;
  },

  /**
   * GET /api/v1/interview/{session_id}/status
   * Poll the current status and conversation of a session.
   */
  async getStatus(sessionId: string): Promise<InterviewStatusResponse> {
    const { data } = await axiosInstance.get<InterviewStatusResponse>(
      `/api/v1/interview/${sessionId}/status`
    );
    return data;
  },

  /**
   * POST /api/v1/interview/{session_id}/evaluate
   * Trigger evaluation and get the scored report.
   */
  async evaluate(sessionId: string): Promise<InterviewEvaluationResponse> {
    const { data } = await axiosInstance.post<InterviewEvaluationResponse>(
      `/api/v1/interview/${sessionId}/evaluate`
    );
    return data;
  },

  /**
   * GET /api/v1/interview/{session_id}/report
   * Retrieve a previously generated evaluation report.
   */
  async getReport(sessionId: string): Promise<InterviewEvaluationResponse> {
    const { data } = await axiosInstance.get<InterviewEvaluationResponse>(
      `/api/v1/interview/${sessionId}/report`
    );
    return data;
  },
    /**
   * GET /api/v1/interview/{session_id}/history
   * Retrieve full interview history with questions and candidate answers.
   */
  async getHistory(sessionId: string): Promise<InterviewHistory> {
    const { data } = await axiosInstance.get<InterviewHistory>(
      `/api/v1/interview/${sessionId}/history`
    );
    return data;
  },
};

