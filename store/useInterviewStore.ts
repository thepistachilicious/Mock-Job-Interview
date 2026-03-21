import { create } from 'zustand';

export interface EvaluationReport {
  session_id: string;
  candidate_name: string | null;
  job_position: string;
  technical_skills: {
    oop: number;
    algorithms: number;
    networking: number;
    system_design: number;
    technology_stack: number;
    average: number;
  };
  project_experience: {
    project_complexity: number;
    role_in_project: number;
    problem_solving: number;
    average: number;
  };
  cultural_fit: {
    company_culture_fit: number;
    teamwork: number;
    communication: number;
    average: number;
  };
  overall_match_score: number;
  recommendation: string;
  strengths: string[];
  areas_for_improvement: string[];
  summary: string;
}

interface InterviewState {
  cvFile: File | null;
  jobPosition: string;
  Company: string;
  jdDescription: string;

  micId: string;
  cameraId: string;
  sessionId: string;
  cvText: string;

  evaluationReport: EvaluationReport | null;

  setCvFile: (file: File | null) => void;
  setJobPosition: (position: string) => void;
  setCompany: (company: string) => void;
  setJdDescription: (description: string) => void;
  setDevices: (micId: string, cameraId: string) => void;
  setSessionId: (id: string) => void;
  setCvText: (text: string) => void;
  setEvaluationReport: (report: EvaluationReport) => void;
  resetStore: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  cvFile: null,
  jobPosition: "",
  Company: "",
  jdDescription: "",
  micId: "",
  cameraId: "",
  sessionId: "",
  cvText: "",
  evaluationReport: null,

  setCvFile: (file) => set({ cvFile: file }),
  setJobPosition: (position) => set({ jobPosition: position }),
  setCompany: (company) => set({ Company: company }),
  setJdDescription: (description) => set({ jdDescription: description }),
  setDevices: (micId, cameraId) => set({ micId, cameraId }),
  setSessionId: (id) => set({ sessionId: id }),
  setCvText: (text) => set({ cvText: text }),
  setEvaluationReport: (report) => set({ evaluationReport: report }),
  resetStore: () => set({
    cvFile: null,
    jobPosition: "",
    Company: "",
    jdDescription: "",
    micId: "",
    cameraId: "",
    sessionId: "",
    cvText: "",
    evaluationReport: null,
  }),
}));