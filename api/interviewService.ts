import type { EvaluationReport } from '@/store/useInterviewStore';

export type { EvaluationReport };

// ─── Upload / extract CV text ─────────────────────────────────────────────

export interface ExtractedText {
  filename: string;
  text: string;
  char_count: number;
}

export const extractCvText = async (file: File): Promise<ExtractedText> => {
  const form = new FormData();
  // FastAPI expects the field name to be exactly "file"
  form.append('file', file);

  // Must use fetch — NOT axiosInstance — for FormData uploads.
  // axiosInstance has a global default `Content-Type: application/json` that
  // either overrides the multipart boundary or strips it entirely, causing
  // FastAPI to fail body validation and return 422 (field "file" missing).
  // fetch() lets the browser auto-set `multipart/form-data; boundary=...`.
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    throw new Error('Not authenticated: access_token missing from localStorage.');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  const response = await fetch(`${apiUrl}/api/v1/upload/pdf`, {
    method: 'POST',
    // Do NOT set Content-Type here — the browser sets it with the multipart boundary.
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`PDF upload failed (${response.status}): ${detail}`);
  }

  return response.json() as Promise<ExtractedText>;
};

// ─── Start interview session ──────────────────────────────────────────────

export interface StartInterviewPayload {
  cv_text: string;
  job_position: string;
  job_description: string;
  company_description: string;
}

export type InterviewStatus = 'preprocessing' | 'in_progress' | 'completed';

export interface SessionResponse {
  session_id: string;
  status: InterviewStatus;
  message: string;
}

export const startInterview = async (
  payload: StartInterviewPayload,
): Promise<SessionResponse> => {
  // Backend uses Form(...) which accepts application/x-www-form-urlencoded.
  // Use fetch + URLSearchParams for the same reason as extractCvText:
  // axiosInstance defaults to Content-Type: application/json which breaks
  // form-encoded bodies even when you explicitly override the header.
  const form = new URLSearchParams();
  form.append('cv_text', payload.cv_text);
  form.append('job_position', payload.job_position);
  form.append('job_description', payload.job_description);
  form.append('company_description', payload.company_description);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    throw new Error('Not authenticated: access_token missing from localStorage.');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  const response = await fetch(`${apiUrl}/api/v1/interview/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    },
    body: form.toString(),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`Start interview failed (${response.status}): ${detail}`);
  }

  return response.json() as Promise<SessionResponse>;
};

// ─── Evaluate interview session ───────────────────────────────────────────

export const evaluateInterview = async (sessionId: string): Promise<EvaluationReport> => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    throw new Error('Not authenticated: access_token missing from localStorage.');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

  const response = await fetch(`${apiUrl}/api/v1/interview/${sessionId}/evaluate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`Evaluate interview failed (${response.status}): ${detail}`);
  }

  return response.json() as Promise<EvaluationReport>;
};
