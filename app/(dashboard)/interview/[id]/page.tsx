"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { useAgora } from "@/app/hooks/useAgora";
import { useSpeechToText } from "@/app/hooks/useSTT";
import { useTextToSpeech } from "@/app/hooks/useTTS";
import { interviewService, getErrorMessage } from "@/api/interviewService";
import VideoTile from "@/app/component/ui/VideoTile";
import LocalCamera from "@/app/component/ui/LocalCamera";
import TranscriptPanel from "@/app/component/ui/TranscriptPanel";
import { useInterviewStore } from "@/store/useInterviewStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "interview" | "ending";

export type MessageRole = "user" | "assistant";

export interface TranscriptMessage {
  id:        string;
  role:      MessageRole;
  content:   string;
  timestamp: number;
}

interface InterviewConfig {
  position:           string;
  level:              string;
  language:           string;
  voice:              string;
  channel:            string;
  cvText:             string;
  jobDescription:     string;
  companyDescription: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// ─── SSE streaming helper ─────────────────────────────────────────────────────

async function* streamNextQuestion(
  sessionId: string,
  answer: string
): AsyncGenerator<string> {
  const form = new URLSearchParams();
  form.append("answer", answer);

  const res = await fetch(
    `${BACKEND_BASE}/api/v1/interview/${sessionId}/question`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
      body: form.toString(),
    }
  );

  console.log("[Stream] status:", res.status, "content-type:", res.headers.get("content-type"));

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Stream error ${res.status}: ${text}`);
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer    = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw || raw === "[DONE]") continue;

      try {
        const parsed = JSON.parse(raw) as { event: string; data: string };
        if (parsed.event === "token" && parsed.data) yield parsed.data;
      } catch (e) {
        if (e instanceof SyntaxError) {
          console.warn("[SSE] SyntaxError on line:", JSON.stringify(line));
          continue;
        }
        throw e;
      }
    }
  }

  console.log("[SSE] stream complete");
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

function Spinner({ size = 16, color = "#22c55e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Live Interview ───────────────────────────────────────────────────────────

function InterviewStep({
  config,
  sessionId,
  onEnd,
}: {
  config:    InterviewConfig;
  sessionId: string;
  onEnd:     (sessionId: string) => void;
}) {
  const [messages,     setMessages]     = useState<TranscriptMessage[]>([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [elapsed,      setElapsed]      = useState(0);
  const [joining,      setJoining]      = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  // Refs that are always fresh — no stale closure issues
  const sessionIdRef = useRef<string>(sessionId);
  const isLoadingRef = useRef(false);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  const agora  = useAgora();
  const tts    = useTextToSpeech();
  const ttsRef = useRef(tts);
  useEffect(() => { ttsRef.current = tts; }, [tts]);

  // Keep isLoadingRef in sync with state (for UI) while async handlers read the ref
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  // ── 1. Poll until session is in_progress ─────────────────────────────────
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const status = await interviewService.getStatus(sessionIdRef.current);
        console.log("[Poll] status:", status.status);

        if (status.status !== "in_progress") return;

        clearInterval(pollRef.current!);
        setSessionReady(true);
        console.log("[Poll] session ready ✅");

        const firstQuestion = status.conversation.find(
          (e) => (e as { role?: string }).role === "assistant"
        ) as { role: string; content: string } | undefined;

        if (firstQuestion?.content) {
          setMessages([{
            id:        crypto.randomUUID(),
            role:      "assistant",
            content:   firstQuestion.content,
            timestamp: Date.now(),
          }]);
          ttsRef.current.speak(firstQuestion.content, config.voice);
        }
      } catch {
        // transient — keep polling
      }
    }, 2000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Join Agora + elapsed clock ────────────────────────────────────────
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID ?? "";
    agora.join(appId, config.channel, null)
      .then(() => setJoining(false))
      .catch(() => setJoining(false));

    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 3. End session ────────────────────────────────────────────────────────
  // Defined before stt so doEnd can call stt.stopListening — but stt isn't
  // available yet, so we use a ref-forwarding pattern via doEndRef below.
  const doEndRef = useRef(async () => {});

  const doEnd = useCallback(async () => {
    doEndRef.current();
  }, []);

  // ── 4. User speech → SSE streamed reply ──────────────────────────────────
  // Stored in a ref so useSpeechToText always calls the latest version
  // without rebuilding the hook on every render.
  const handleFinalTranscriptImpl = useRef(async (_text: string) => {});

  useEffect(() => {
    handleFinalTranscriptImpl.current = async (text: string) => {
      console.log("[STT] received:", text);
      console.log("[STT] isLoadingRef:", isLoadingRef.current, "| sessionId:", sessionIdRef.current);

      if (!text.trim()) {
        console.warn("[STT] bail: empty transcript");
        return;
      }
      if (isLoadingRef.current) {
        console.warn("[STT] bail: already loading");
        return;
      }
      if (!sessionIdRef.current) {
        console.warn("[STT] bail: no session id");
        return;
      }

      const assistantId = crypto.randomUUID();

      // Add user message + empty assistant placeholder in one update
      // so assistantId is stable before any streaming tokens arrive
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user",      content: text, timestamp: Date.now() },
        { id: assistantId,         role: "assistant", content: "",   timestamp: Date.now() },
      ]);

      isLoadingRef.current = true;
      setIsLoading(true);

      let fullText = "";

      try {
        console.log("[STT] starting SSE stream for session:", sessionIdRef.current);

        for await (const token of streamNextQuestion(sessionIdRef.current, text)) {
          fullText += token;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: fullText } : msg
            )
          );
        }

        console.log("[STT] stream complete, chars:", fullText.length);

        if (fullText.trim()) {
          ttsRef.current.speak(fullText, config.voice);
        }
      } catch (err) {
        console.error("[STT] stream error:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: `⚠️ ${getErrorMessage(err)}` }
              : msg
          )
        );
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    };
  }, [config.voice]);

  // Stable wrapper — identity never changes so useSpeechToText won't re-subscribe
  const stableHandleTranscript = useCallback((text: string) => {
    handleFinalTranscriptImpl.current(text);
  }, []);

  const stt = useSpeechToText(stableHandleTranscript);

  // Now wire up doEndRef with the real stt instance
  useEffect(() => {
    doEndRef.current = async () => {
      stt.stopListening();
      ttsRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current)  clearInterval(pollRef.current);
      await agora.leave();
      onEnd(sessionIdRef.current);
    };
  }, [stt, agora, onEnd]);

  // ── Derived UI values ─────────────────────────────────────────────────────
  const mm       = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss       = String(elapsed % 60).padStart(2, "0");
  const sttActive = stt.isListening || stt.isTranscribing;

  if (joining) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Spinner size={40} />
        <p className="text-[#64748b] text-sm">Đang kết nối phòng phỏng vấn…</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-[calc(100vh-57px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#0f172a] shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[#22c55e] text-xs font-mono font-semibold">{mm}:{ss}</span>
          <span className="text-[#334155] text-xs">·</span>
          <span className="text-[#64748b] text-xs truncate max-w-[160px]">{config.position}</span>
          {!sessionReady && (
            <span className="flex items-center gap-1.5 text-[#f59e0b] text-xs">
              <Spinner size={11} color="#f59e0b" /> Đang chuẩn bị…
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mic */}
          <button
            onClick={agora.toggleAudio}
            title={agora.isAudioMuted ? "Bật mic" : "Tắt mic"}
            className={`p-2.5 rounded-xl border transition ${
              agora.isAudioMuted
                ? "bg-[#f43f5e]/15 border-[#f43f5e]/40 text-[#f43f5e]"
                : "bg-[#0f172a] border-[#1e293b] text-[#64748b] hover:text-white"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {agora.isAudioMuted ? (
                <>
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2" />
                </>
              ) : (
                <>
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </>
              )}
            </svg>
          </button>

          {/* Camera */}
          <button
            onClick={agora.toggleVideo}
            title={agora.isVideoMuted ? "Bật camera" : "Tắt camera"}
            className={`p-2.5 rounded-xl border transition ${
              agora.isVideoMuted
                ? "bg-[#f43f5e]/15 border-[#f43f5e]/40 text-[#f43f5e]"
                : "bg-[#0f172a] border-[#1e293b] text-[#64748b] hover:text-white"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {agora.isVideoMuted ? (
                <>
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" />
                  <path d="M23 7l-7 5 7 5V7z" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </>
              )}
            </svg>
          </button>

          {/* AI Listen */}
          <button
            onClick={() => stt.isListening ? stt.stopListening() : stt.startListening()}
            disabled={stt.isTranscribing || !sessionReady}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${
              sttActive
                ? "bg-[#22c55e]/15 border-[#22c55e]/40 text-[#22c55e]"
                : "bg-[#0f172a] border-[#1e293b] text-[#64748b] hover:text-white"
            }`}
          >
            {stt.isTranscribing ? <Spinner size={12} /> : stt.isListening ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="6" />
              </svg>
            )}
            {stt.isTranscribing ? "Whisper…" : stt.isListening ? "Stop AI" : "AI Listen"}
          </button>

          {/* Stop TTS */}
          {tts.isSpeaking && (
            <button
              aria-label="Dừng giọng nói"
              onClick={tts.stop}
              className="p-2.5 rounded-xl border border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#a78bfa] hover:bg-[#a78bfa]/20 transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            </button>
          )}

          {/* End */}
          <button
            onClick={doEnd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-[#f43f5e] text-xs font-semibold hover:bg-[#f43f5e]/25 transition"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.44 17.29 7.76 15.32 6.68 13" />
              <path d="M6.68 6.68A15.9 15.9 0 0 0 4 12.4" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            Kết thúc
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-4 gap-3 min-w-0">
          <div className="flex-1 flex gap-3 overflow-hidden">
            {/* AI tile */}
            <div className="w-52 shrink-0 rounded-2xl bg-[#0b1120] border border-[#1e293b] relative overflow-hidden flex items-center justify-center">
              {agora.remoteUsers.length > 0 ? (
                agora.remoteUsers.map((u) => (
                  <div key={u.uid} className="absolute inset-0">
                    <VideoTile
                      videoTrack={u.videoTrack}
                      uid={u.uid}
                      isMuted={!u.hasAudio}
                      isSpeaking={tts.isSpeaking}
                    />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl border-2 transition-all ${
                      tts.isSpeaking
                        ? "border-[#22c55e] shadow-[0_0_24px_rgba(34,197,94,0.3)]"
                        : "border-[#1e293b]"
                    }`}
                    style={{ background: "radial-gradient(circle, #0f1f3a 0%, #060d1a 100%)" }}
                  >
                    🤖
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-semibold">AI Interviewer</p>
                    <p className="text-[#334155] text-xs mt-0.5">
                      {tts.isSpeaking
                        ? "Đang nói…"
                        : isLoading
                          ? "Đang suy nghĩ…"
                          : !sessionReady
                            ? "Đang chuẩn bị câu hỏi…"
                            : "Đang chờ bạn"}
                    </p>
                  </div>
                  {tts.isSpeaking && (
                    <div className="flex gap-1 items-end h-5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#22c55e] rounded-full animate-pulse"
                          style={{ height: `${8 + (i % 3) * 6}px`, animationDelay: `${i * 0.12}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur px-2 py-1 rounded-lg text-xs text-[#94a3b8]">
                AI Interviewer
              </div>
            </div>

            {/* Local tile — plain getUserMedia, no Agora */}
            <div className="w-52 shrink-0 flex-1 h-full">
              <LocalCamera
                isSpeaking={stt.isListening && !stt.isTranscribing}
                label="Bạn"
              />
            </div>
          </div>

          {/* Live STT bar */}
          {stt.isListening && (
            <div className="bg-[#0b1120] border border-[#22c55e]/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-0.5 items-end h-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#22c55e] rounded-full animate-pulse"
                    style={{ height: `${6 + (i % 3) * 4}px`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <p className="text-sm text-[#94a3b8] flex-1 italic truncate">
                {stt.interimTranscript || stt.isTranscribing
                  ? "Đang nhận dạng giọng nói…"
                  : "Đang nghe — hãy nói…"}
              </p>
            </div>
          )}
        </div>

        {/* Transcript sidebar */}
        <div className="w-80 shrink-0 border-l border-[#0f172a] flex flex-col overflow-hidden">
          <TranscriptPanel
            messages={messages}
            interimTranscript={stt.interimTranscript}
            isListening={stt.isListening}
            isSpeaking={tts.isSpeaking}
            isLoading={isLoading || stt.isTranscribing}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Ending ───────────────────────────────────────────────────────────────────

function EndingStep({
  sessionId,
  onNavigate,
}: {
  sessionId:  string;
  onNavigate: () => void;
}) {
  const [phase, setPhase] = useState<"evaluating" | "done" | "error">("evaluating");
  const [dots,  setDots]  = useState(1);

  useEffect(() => {
    const dotTimer = setInterval(() => setDots((d) => (d % 3) + 1), 500);
    let navTimer: ReturnType<typeof setTimeout>;

    if (sessionId) {
      interviewService
        .evaluate(sessionId)
        .then(() => {
          setPhase("done");
          navTimer = setTimeout(onNavigate, 1800);
        })
        .catch(() => {
          setPhase("error");
          navTimer = setTimeout(onNavigate, 2000);
        });
    } else {
      navTimer = setTimeout(onNavigate, 1000);
    }

    return () => {
      clearInterval(dotTimer);
      clearTimeout(navTimer);
    };
  }, [sessionId, onNavigate]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-6 py-24 text-center"
    >
      <div
        className={`w-20 h-20 rounded-full border-2 flex items-center justify-center text-4xl transition-all duration-500 ${
          phase === "done"
            ? "bg-[#22c55e]/10 border-[#22c55e]/30"
            : phase === "error"
            ? "bg-[#f59e0b]/10 border-[#f59e0b]/30"
            : "bg-[#3b82f6]/10 border-[#3b82f6]/30"
        }`}
      >
        {phase === "done" ? "✅" : phase === "error" ? "⚠️" : "🧠"}
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-white">
          {phase === "done"
            ? "Phân tích hoàn tất!"
            : phase === "error"
            ? "Phỏng vấn kết thúc"
            : "Phỏng vấn kết thúc!"}
        </h2>
        <p className="text-[#64748b] text-sm mt-2">
          {phase === "evaluating"
            ? `AI đang phân tích kết quả${".".repeat(dots)}`
            : phase === "done"
            ? "Đang chuyển đến báo cáo của bạn…"
            : "Đang chuyển đến báo cáo…"}
        </p>
        {sessionId && (
          <p className="text-[#334155] font-mono text-xs mt-1">
            Session: {sessionId.slice(0, 16)}…
          </p>
        )}
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full animate-pulse ${
              phase === "done"
                ? "bg-[#22c55e]"
                : phase === "error"
                ? "bg-[#f59e0b]"
                : "bg-[#3b82f6]"
            }`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── ROOT PAGE ────────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const router    = useRouter();
  const params    = useParams();
  const sessionId = params.id as string;

  const cvText        = useInterviewStore((s) => s.cvText);
  const jobPosition   = useInterviewStore((s) => s.jobPosition);
  const jdDescription = useInterviewStore((s) => s.jdDescription);
  const company       = useInterviewStore((s) => s.Company);

  useEffect(() => {
    if (!cvText) router.replace("/interview/upload-cv");
  }, [cvText, router]);

  const [config] = useState<InterviewConfig>(() => ({
    position:           jobPosition   || "Software Engineer",
    level:              "Mid-level (2–4 yrs)",
    language:           "Tiếng Việt",
    voice:              "nova",
    channel:            "interview-" + Math.random().toString(36).slice(2, 7),
    cvText,
    jobDescription:     jdDescription,
    companyDescription: company,
  }));

  const [step, setStep] = useState<Step>("interview");

  if (!cvText) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Body */}
      <div
        className={`flex-1 ${
          step === "interview"
            ? "pt-[57px]"
            : "pt-[57px] px-4 py-8 flex items-start justify-center"
        }`}
      >
        <AnimatePresence mode="wait">
          {step === "interview" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <InterviewStep
                config={config}
                sessionId={sessionId}
                onEnd={() => setStep("ending")}
              />
            </motion.div>
          )}

          {step === "ending" && (
            <motion.div
              key="ending"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeUp}
              className="w-full max-w-lg pt-8"
            >
              <EndingStep
                sessionId={sessionId}
                onNavigate={() =>
                  router.push(
                    sessionId
                      ? `/interview/${sessionId}/assessment`
                      : "/interview/upload-cv"
                  )
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}