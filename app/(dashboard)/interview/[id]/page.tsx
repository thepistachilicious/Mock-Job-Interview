"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAgora } from "@/app/hooks/useAgora";
import { evaluateInterview } from "@/api/interviewService";
import { useInterviewStore } from "@/store/useInterviewStore";
import type { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

type Section = "tech" | "project" | "situation" | null;
type ConversationEntry = { role: "interviewer" | "candidate"; content: string };

const SECTION_LABELS: Record<NonNullable<Section>, string> = {
  tech: "Technical",
  project: "Project",
  situation: "Situational",
};

const SECTION_COLORS: Record<NonNullable<Section>, string> = {
  tech: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  project: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  situation: "bg-orange-500/20 text-orange-400 border-orange-500/40",
};

// ─── Stable remote video component ────────────────────────────────────────────
// Isolated per-user component prevents video playback issues from inline ref
// callbacks being recreated on every parent render.
function RemoteVideo({ user }: { user: IAgoraRTCRemoteUser }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && user.videoTrack) {
      user.videoTrack.play(containerRef.current);
    }
    return () => {
      user.videoTrack?.stop();
    };
  }, [user.videoTrack]);

  return <div ref={containerRef} className="w-full h-full" />;
}

export default function OngoingInterview() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const sessionId = params.id;
  const setEvaluationReport = useInterviewStore((s) => s.setEvaluationReport);

  const {
    join,
    leave,
    toggleMic,
    toggleCamera,
    connectionState,
    micOn,
    camOn,
    error: agoraError,
    localVideoRef,
    remoteUsers,
  } = useAgora();

  // ── Timer ──────────────────────────────────────────────────────────────────
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTimer((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Agora auto-join (once per mount) ───────────────────────────────────────
  // joinedRef prevents double-join in StrictMode and on dependency re-runs.
  // Reset in cleanup so a future remount (e.g. HMR) can rejoin cleanly.
  const joinedRef = useRef(false);
  useEffect(() => {
    if (!joinedRef.current && sessionId) {
      joinedRef.current = true;
      join(sessionId);
    }
    return () => {
      // Reset allows rejoin if this component remounts without full page reload
      joinedRef.current = false;
    };
  // join is now stable (no connectionState dep), so this runs once per sessionId
  }, [join, sessionId]);

  // ── SSE / Interview state ──────────────────────────────────────────────────
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentSection, setCurrentSection] = useState<Section>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [answerInput, setAnswerInput] = useState("");
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const sseStartedRef = useRef(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentQuestion, conversation]);

  // ── SSE stream runner ──────────────────────────────────────────────────────
  const runSSE = useCallback(
    async (answer?: string) => {
      if (!sessionId) return;

      // Abort any in-flight SSE before starting a new one — prevents duplicates
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const form = new FormData();
      if (answer !== undefined) {
        form.append("answer", answer);
      }

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

      try {
        setStreamError(null);

        const response = await fetch(
          `${apiUrl}/api/v1/interview/${sessionId}/question`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token ?? ""}` },
            body: form,
            signal: controller.signal,
          },
        );

        if (!response.ok || !response.body) {
          const msg = response.status === 409
            ? "Interview already completed."
            : `Server error (HTTP ${response.status})`;
          throw new Error(msg);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const parsed = JSON.parse(raw) as { event: string; data: string };

              if (parsed.event === "question_start") {
                setCurrentSection(parsed.data as Section);
                setCurrentQuestion("");
                setIsStreaming(true);
                setQuestionCount((c) => c + 1);
              } else if (parsed.event === "token") {
                setCurrentQuestion((q) => q + parsed.data);
              } else if (parsed.event === "interview_end") {
                setIsStreaming(false);
                setInterviewEnded(true);

                try {
                  setIsEvaluating(true);
                  const report = await evaluateInterview(sessionId);
                  setEvaluationReport(report);
                } catch (evalErr) {
                  console.error("[Eval] failed:", evalErr);
                } finally {
                  setIsEvaluating(false);
                  try { await leave(); } catch { /* ignore */ }
                  router.push("/interview/assessment");
                }
              } else if (parsed.event === "error") {
                setStreamError(parsed.data);
                setIsStreaming(false);
              }
            } catch {
              // Ignore malformed JSON lines
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // intentional abort
        setStreamError(
          err instanceof Error ? err.message : "Stream connection failed",
        );
        setIsStreaming(false);
      }
    },
    [sessionId, leave, router, setEvaluationReport],
  );

  // ── Auto-start first question on mount ────────────────────────────────────
  useEffect(() => {
    if (!sseStartedRef.current && sessionId) {
      sseStartedRef.current = true;
      runSSE();
    }
  }, [sessionId, runSSE]);

  // ── Cleanup SSE on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // ── Submit answer ──────────────────────────────────────────────────────────
  const handleSubmitAnswer = () => {
    const trimmed = answerInput.trim();
    if (!trimmed || isStreaming || interviewEnded) return;

    if (currentQuestion) {
      setConversation((prev) => [
        ...prev,
        { role: "interviewer", content: currentQuestion },
        { role: "candidate", content: trimmed },
      ]);
    }

    setAnswerInput("");
    setCurrentQuestion("");
    runSSE(trimmed);
    answerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  // ── End call manually ─────────────────────────────────────────────────────
  const handleEndCall = async () => {
    abortControllerRef.current?.abort();
    try { await leave(); } catch { /* ignore */ }
    router.push("/interview/assessment");
  };

  const isConnecting = connectionState === "connecting";
  const isConnected = connectionState === "connected";
  const hasRemoteVideo = remoteUsers.some((u) => u.videoTrack);
  const canSubmit = answerInput.trim().length > 0 && !isStreaming && !interviewEnded;

  return (
    <div className="h-screen w-full bg-[#0b1120] text-white flex flex-col font-sans overflow-hidden">
      {/* ─── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="flex-none w-full flex items-center justify-between px-6 py-3 bg-black/50 backdrop-blur-md border-b border-[#334155]/60 z-40">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-[#22c55e] rounded-full" />
          <h1 className="text-base font-bold tracking-tight">
            AI <span className="text-[#22c55e]">Interview</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-black/60 border border-[#334155] px-4 py-1.5 rounded-full text-sm">
          <div className="flex items-center gap-1.5 text-[#94a3b8]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-mono text-white w-10 text-center">{formatTime(timer)}</span>
          </div>
          <div className="h-4 w-px bg-[#334155]" />
          <div className="text-sm font-medium text-white">
            Question{" "}
            <span className="text-[#22c55e] font-bold">{questionCount}</span>
          </div>
          {currentSection && (
            <>
              <div className="h-4 w-px bg-[#334155]" />
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${SECTION_COLORS[currentSection]}`}
              >
                {SECTION_LABELS[currentSection]}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs min-w-[100px] justify-end">
          {isConnecting && (
            <span className="flex items-center gap-1.5 text-yellow-400">
              <span className="animate-spin rounded-full h-3 w-3 border border-yellow-400 border-t-transparent" />
              Connecting...
            </span>
          )}
          {isConnected && (
            <span className="flex items-center gap-1.5 text-[#22c55e]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
              </span>
              Connected
            </span>
          )}
          {connectionState === "idle" && !isConnecting && (
            <span className="text-[#64748b]">Standby</span>
          )}
          {connectionState === "disconnecting" && (
            <span className="text-red-400 flex items-center gap-1.5">
              <span className="animate-spin rounded-full h-3 w-3 border border-red-400 border-t-transparent" />
              Disconnecting...
            </span>
          )}
        </div>
      </header>

      {/* ─── ERROR BANNERS ────────────────────────────────────────────────────── */}
      {agoraError && (
        <div className="flex-none w-full bg-red-900/50 border-b border-red-700/50 px-6 py-2 text-sm text-red-300 text-center z-50">
          Video error: {agoraError}
        </div>
      )}
      {streamError && (
        <div className="flex-none w-full bg-orange-900/50 border-b border-orange-700/50 px-6 py-2 text-sm text-orange-300 text-center z-50">
          {streamError}
          <button
            onClick={() => { setStreamError(null); runSSE(); }}
            className="ml-3 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
      {isEvaluating && (
        <div className="flex-none w-full bg-[#22c55e]/10 border-b border-[#22c55e]/30 px-6 py-2 text-sm text-[#22c55e] text-center z-50 flex items-center justify-center gap-2">
          <span className="animate-spin rounded-full h-3 w-3 border border-[#22c55e] border-t-transparent" />
          Generating your evaluation report...
        </div>
      )}

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden">
        {/* ── LEFT: Video Section ──────────────────────────────────────────────── */}
        <div className="relative flex-[0_0_48%] flex flex-col items-center justify-center bg-black/40 border-r border-[#334155]/50 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#22c55e] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />

          {/* ── AI / Remote video ── */}
          <div className="relative z-10 flex items-center justify-center">
            {hasRemoteVideo ? (
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-[3px] border-[#22c55e]/40 shadow-[0_0_40px_rgba(34,197,94,0.12)]">
                {remoteUsers.map((user) =>
                  user.videoTrack ? (
                    // Stable RemoteVideo component — avoids inline ref recreation issues
                    <RemoteVideo key={user.uid} user={user} />
                  ) : null,
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-[#22c55e] opacity-10 rounded-full blur-xl scale-[1.3] animate-pulse" />
                <div className="absolute inset-0 border border-[#22c55e]/20 rounded-full scale-[1.15]" />
                <div className="w-36 h-36 md:w-44 md:h-44 bg-black border-[3px] border-[#1e293b] rounded-full flex items-center justify-center shadow-2xl relative z-10">
                  {isConnecting ? (
                    <span className="animate-spin rounded-full h-10 w-10 border-2 border-[#22c55e] border-t-transparent" />
                  ) : (
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>
                <div className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 bg-[#22c55e]/10 border border-[#22c55e]/30 px-3 py-1 rounded-full text-[10px] text-[#22c55e] font-bold tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                  {isStreaming ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
                      </span>
                      AI SPEAKING
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
                      </span>
                      AI LISTENING
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Local video preview ── */}
          <div className="absolute bottom-20 right-4 w-36 md:w-44 aspect-video bg-black border border-[#334155] rounded-xl shadow-xl z-20 overflow-hidden">
            <div
              ref={localVideoRef}
              className={`w-full h-full ${camOn ? "block" : "hidden"}`}
            />
            {!camOn && (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#475569] gap-1">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <span className="text-[9px] font-medium">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 text-[9px] bg-black/70 px-1.5 py-0.5 rounded text-white font-medium backdrop-blur-sm">
              You {!micOn && "(Muted)"}
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md border border-[#334155] px-5 py-2 rounded-full z-30 shadow-lg">
            <button
              onClick={toggleMic}
              disabled={!isConnected}
              title={micOn ? "Mute" : "Unmute"}
              className={`p-2.5 rounded-full transition-all duration-200 disabled:opacity-40 ${
                micOn
                  ? "bg-[#1e293b] text-white hover:bg-[#334155]"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {micOn ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                </svg>
              )}
            </button>

            <button
              onClick={toggleCamera}
              disabled={!isConnected}
              title={camOn ? "Stop Camera" : "Start Camera"}
              className={`p-2.5 rounded-full transition-all duration-200 disabled:opacity-40 ${
                camOn
                  ? "bg-[#1e293b] text-white hover:bg-[#334155]"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {camOn ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>

            <div className="h-6 w-px bg-[#334155] mx-1" />

            <button
              onClick={handleEndCall}
              disabled={connectionState === "disconnecting" || isEvaluating}
              className="px-4 py-2 rounded-full bg-red-600 text-white font-bold text-sm tracking-wide hover:bg-red-700 transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {connectionState === "disconnecting" ? "Ending..." : "End"}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Q&A Panel ──────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-[#080e1a] overflow-hidden">
          <div className="flex-none px-5 py-3 border-b border-[#1e293b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-sm font-semibold text-[#94a3b8]">Interview</span>
            </div>
            {isStreaming && (
              <div className="flex items-center gap-1.5 text-xs text-[#22c55e]">
                <span className="animate-pulse w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                Streaming
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e293b]">
            {/* Past conversation */}
            {conversation.map((entry, i) => (
              <div
                key={i}
                className={`flex gap-3 ${entry.role === "candidate" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex-none w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    entry.role === "interviewer"
                      ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {entry.role === "interviewer" ? "AI" : "Me"}
                </div>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    entry.role === "interviewer"
                      ? "bg-[#0f1929] border border-[#1e293b] text-[#e2e8f0] rounded-tl-sm"
                      : "bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#dcfce7] rounded-tr-sm"
                  }`}
                >
                  {entry.content}
                </div>
              </div>
            ))}

            {/* Current streaming question */}
            {(currentQuestion || isStreaming) && !interviewEnded && (
              <div className="flex gap-3 flex-row">
                <div className="flex-none w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 shrink-0">
                  AI
                </div>
                <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm bg-[#0f1929] border border-[#1e293b] text-sm text-[#e2e8f0] leading-relaxed">
                  {currentQuestion}
                  {isStreaming && (
                    <span className="inline-block w-1.5 h-4 bg-[#22c55e] rounded-sm ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            )}

            {/* Empty state */}
            {conversation.length === 0 && !currentQuestion && !isStreaming && !interviewEnded && (
              <div className="flex flex-col items-center justify-center h-full pt-16 pb-4 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[#0f1929] border border-[#1e293b] flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-[#22c55e] border-t-transparent" />
                </div>
                <p className="text-sm text-[#475569]">Preparing your first question...</p>
              </div>
            )}

            {/* Interview ended state */}
            {interviewEnded && !isEvaluating && (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#22c55e]">Interview Complete</p>
                <p className="text-xs text-[#475569]">Generating your evaluation...</p>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* ── Answer input area ── */}
          <div className="flex-none border-t border-[#1e293b] p-4">
            <div
              className={`flex gap-3 items-end bg-[#0f1929] border rounded-2xl px-4 py-3 transition-colors ${
                canSubmit
                  ? "border-[#22c55e]/40 shadow-[0_0_12px_rgba(34,197,94,0.06)]"
                  : "border-[#1e293b]"
              }`}
            >
              <textarea
                ref={answerRef}
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming || interviewEnded}
                placeholder={
                  interviewEnded
                    ? "Interview complete"
                    : isStreaming
                    ? "AI is asking..."
                    : "Type your answer... (Enter to send, Shift+Enter for new line)"
                }
                rows={3}
                className="flex-1 bg-transparent text-[#e2e8f0] text-sm placeholder-[#334155] resize-none outline-none disabled:cursor-not-allowed leading-relaxed"
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!canSubmit}
                className={`flex-none mb-0.5 p-2.5 rounded-xl transition-all duration-200 ${
                  canSubmit
                    ? "bg-[#22c55e] text-black hover:bg-[#1ea34d] active:scale-95 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                    : "bg-[#1e293b] text-[#334155] cursor-not-allowed"
                }`}
                title="Send answer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-[#334155] mt-2 text-center">
              Press <kbd className="px-1 py-0.5 bg-[#1e293b] rounded text-[#475569] font-mono">Enter</kbd> to send &nbsp;·&nbsp;
              <kbd className="px-1 py-0.5 bg-[#1e293b] rounded text-[#475569] font-mono">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
