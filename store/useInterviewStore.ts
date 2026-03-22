import { create } from "zustand";

interface InterviewStore {
  cvFile: File | null;
  cvText: string;          // ← NEW: extracted PDF text
  jdDescription: string;
  jobPosition: string;
  Company: string;

  setCvFile: (file: File | null) => void;
  setCvText: (text: string) => void;  // ← NEW
  setJdDescription: (jd: string) => void;
  setJobPosition: (pos: string) => void;
  setCompany: (company: string) => void;
}

export const useInterviewStore = create<InterviewStore>((set) => ({
  cvFile: null,
  cvText: "",
  jdDescription: "",
  jobPosition: "",
  Company: "",

  setCvFile: (file) => set({ cvFile: file }),
  setCvText: (text) => set({ cvText: text }),   // ← NEW
  setJdDescription: (jd) => set({ jdDescription: jd }),
  setJobPosition: (pos) => set({ jobPosition: pos }),
  setCompany: (company) => set({ Company: company }),
}));