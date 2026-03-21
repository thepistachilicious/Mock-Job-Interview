'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { evaluateInterview } from '@/api/interviewService';
import { useInterviewStore } from '@/store/useInterviewStore';

export type Section = 'tech' | 'project' | 'situation' | null;
export type ConversationEntry = { role: 'interviewer' | 'candidate'; content: string };

export interface UseInterviewSSEReturn {
  currentQuestion: string;
  isStreaming: boolean;
  currentSection: Section;
  questionCount: number;
  conversation: ConversationEntry[];
  answerInput: string;
  setAnswerInput: (v: string) => void;
  interviewEnded: boolean;
  isEvaluating: boolean;
  streamError: string | null;
  setStreamError: (v: string | null) => void;
  runSSE: (answer?: string) => Promise<void>;
  submitAnswer: (text: string) => void;
}

export function useInterviewSSE(
  sessionId: string,
  onEnd?: () => Promise<void>,
): UseInterviewSSEReturn {
  const router = useRouter();
  const setEvaluationReport = useInterviewStore((s) => s.setEvaluationReport);

  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isStreaming, setIsStreaming]           = useState(false);
  const [currentSection, setCurrentSection]     = useState<Section>(null);
  const [questionCount, setQuestionCount]       = useState(0);
  const [conversation, setConversation]         = useState<ConversationEntry[]>([]);
  const [answerInput, setAnswerInput]           = useState('');
  const [interviewEnded, setInterviewEnded]     = useState(false);
  const [isEvaluating, setIsEvaluating]         = useState(false);
  const [streamError, setStreamError]           = useState<string | null>(null);

  const abortRef   = useRef<AbortController | null>(null);
  const startedRef = useRef(false);

  const runSSE = useCallback(async (answer?: string) => {
    if (!sessionId) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const token  = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
    const form   = new FormData();
    if (answer !== undefined) form.append('answer', answer);

    try {
      setStreamError(null);

      const res = await fetch(`${apiUrl}/api/v1/interview/${sessionId}/question`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}` },
        body: form,
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const msg = res.status === 409 ? 'Interview already completed.' : `Server error (HTTP ${res.status})`;
        throw new Error(msg);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const parsed = JSON.parse(raw) as { event: string; data: string };

            if (parsed.event === 'question_start') {
              setCurrentSection(parsed.data as Section);
              setCurrentQuestion('');
              setIsStreaming(true);
              setQuestionCount((c) => c + 1);
            } else if (parsed.event === 'token') {
              setCurrentQuestion((q) => q + parsed.data);
            } else if (parsed.event === 'interview_end') {
              setIsStreaming(false);
              setInterviewEnded(true);

              try {
                setIsEvaluating(true);
                const report = await evaluateInterview(sessionId);
                setEvaluationReport(report);
              } catch (evalErr) {
                console.error('[SSE] evaluation failed:', evalErr);
              } finally {
                setIsEvaluating(false);
                await onEnd?.().catch(() => {});
                router.push('/interview/assessment');
              }
            } else if (parsed.event === 'error') {
              setStreamError(parsed.data);
              setIsStreaming(false);
            }
          } catch {
            // ignore malformed JSON lines
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setStreamError(err instanceof Error ? err.message : 'Stream connection failed');
      setIsStreaming(false);
    }
  }, [sessionId, onEnd, router, setEvaluationReport]);

  // Auto-start first question on mount
  useEffect(() => {
    if (!startedRef.current && sessionId) {
      startedRef.current = true;
      runSSE();
    }
  }, [sessionId, runSSE]);

  // Abort in-flight SSE on unmount
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const submitAnswer = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming || interviewEnded) return;

    if (currentQuestion) {
      setConversation((prev) => [
        ...prev,
        { role: 'interviewer', content: currentQuestion },
        { role: 'candidate',   content: trimmed },
      ]);
    }

    setAnswerInput('');
    setCurrentQuestion('');
    runSSE(trimmed);
  }, [isStreaming, interviewEnded, currentQuestion, runSSE]);

  return {
    currentQuestion,
    isStreaming,
    currentSection,
    questionCount,
    conversation,
    answerInput,
    setAnswerInput,
    interviewEnded,
    isEvaluating,
    streamError,
    setStreamError,
    runSSE,
    submitAnswer,
  };
}
