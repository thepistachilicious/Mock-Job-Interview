import { create } from 'zustand';

interface InterviewState {
  cvFile: File | null;
  jobPosition: string;
  Company: string;
  jdDescription: string;

  micId: string;
  cameraId: string;

  setCvFile: (file: File | null) => void;
  setJobPosition: (position: string) => void;
  setCompany: (company: string) => void;
  setJdDescription: (description: string) => void;
  setDevices: (micId: string, cameraId: string) => void;
  resetStore: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  cvFile: null,
  jobPosition: "",
  Company: "",
  jdDescription: "",
  micId: "",
  cameraId: "",

  setCvFile: (file) => set({ cvFile: file }),
  setJobPosition: (position) => set({ jobPosition: position }),
  setCompany: (company) => set({ Company: company }),
  setJdDescription: (description) => set({ jdDescription: description }),
  setDevices: (micId, cameraId) => set({ micId, cameraId }),
  resetStore: () => set({ cvFile: null, jobPosition: "", Company: "", jdDescription: "", micId: "", cameraId: "" }),
}));