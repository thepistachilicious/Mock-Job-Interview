import { create } from "zustand";

interface InterviewStore {
  cvFile: File | null;
  cvText: string;
  jdDescription: string;
  jobPosition: string;
  Company: string;
  selectedMic: string;
  selectedCamera: string;

  setCvFile: (file: File | null) => void;
  setCvText: (text: string) => void;
  setJdDescription: (jd: string) => void;
  setJobPosition: (pos: string) => void;
  setCompany: (company: string) => void;
  setDevices: (cameraId: string, micId: string) => void;
}

export const useInterviewStore = create<InterviewStore>((set) => ({
  cvFile: null,
  cvText: "",
  jdDescription: "",
  jobPosition: "",
  Company: "",
  selectedMic: "",
  selectedCamera: "",

  setCvFile: (file) => set({ cvFile: file }),
  setCvText: (text) => set({ cvText: text }),
  setJdDescription: (jd) => set({ jdDescription: jd }),
  setJobPosition: (pos) => set({ jobPosition: pos }),
  setCompany: (company) => set({ Company: company }),
  setDevices: (cameraId, micId) =>
    set({ selectedCamera: cameraId, selectedMic: micId }),
}));