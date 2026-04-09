"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAgora } from "@/app/hooks/useAgora";
import { useSpeechToText } from "@/app/hooks/useSTT";
import { useTextToSpeech } from "@/app/hooks/useTTS";
import {
  interviewService,
  StartInterviewRequest,
  getErrorMessage,
} from "@/api/interviewService";
import VideoTile from "./VideoTile";
import TranscriptPanel from "./TranscriptPanel";
import JoinForm from "./JoinForm";

// ─── Types ────────────────────────────────────────────────────────────────────

type TranscriptMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export interface JoinPayload {
  appId: string;
  channel: string;
  token: string | null;
  cvText: string;
  jobPosition: string;
  jobDescription: string;
  companyDescription: string;
}

// ─── SSE streaming helper ─────────────────────────────────────────────────────

async function* streamNextQuestion(
  sessionId: string,
  answer: string,
  backendBase: string
): AsyncGenerator<string> {
  const form = new URLSearchParams();
  form.append("answer", answer);

  const res = await fetch(
    `${backendBase}/api/v1/interview/${sessionId}/question`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",  // ✅ correct
        Accept: "text/event-stream",                           // ✅ only SSE
        "Cache-Control": "no-cache",
      },
      body: form.toString(),
    }
  );

  const contentType = res.headers.get("content-type") ?? "";
  console.log("[Stream] status:", res.status, "content-type:", contentType);

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Stream error ${res.status}: ${text}`);
  }

  const reader = res.body.getReader();
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
      if (!raw || raw === "[DONE]") continue;

      try {
        const parsed = JSON.parse(raw) as { event: string; data: string };
        console.log("[SSE parsed]", parsed);

        if (parsed.event === "token" && parsed.data) {
          yield parsed.data;
        }
        // "question_start" and any other events are intentionally skipped
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

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

const VOICE_OPTIONS = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function VideoCallRoom() {
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("nova");
  const [sessionReady, setSessionReady] = useState(false);

  const sessionIdRef = useRef<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mutable refs so async handlers always read fresh values without stale closures
  const isLoadingRef = useRef(false);
  const selectedVoiceRef = useRef(selectedVoice);

  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { selectedVoiceRef.current = selectedVoice; }, [selectedVoice]);

  const agora = useAgora();
  const tts = useTextToSpeech();
  const ttsRef = useRef(tts);
  useEffect(() => { ttsRef.current = tts; }, [tts]);

  // ── Join ───────────────────────────────────────────────────────────────────

  const handleJoin = useCallback(
    async (payload: JoinPayload) => {
      await agora.join(payload.appId, payload.channel, payload.token);

      const req: StartInterviewRequest = {
        cv_text: payload.cvText,
        job_position: payload.jobPosition,
        job_description: payload.jobDescription,
        company_description: payload.companyDescription,
      };

      try {
        const res = await interviewService.startInterview(req);
        sessionIdRef.current = res.session_id;
        console.log("[Join] session_id set to:", sessionIdRef.current); // add this
        console.log("[Join] session started:", res.session_id);

        pollRef.current = setInterval(async () => {
          try {
            const status = await interviewService.getStatus(res.session_id);

            if (status.status !== "in_progress") {
              console.log("[Poll] status:", status.status, "— still waiting"); // add this
              return;
            }
            console.log("[Poll] session is in_progress ✅"); // add this
            clearInterval(pollRef.current!);
            setSessionReady(true);
            console.log("[Poll] session ready, id:", res.session_id);

            // Try to load full history; fall back to the first AI message from status
            try {
              const history = await interviewService.getHistory(res.session_id);

              const maxLen = Math.max(
                history.interviewer?.length ?? 0,
                history.candidate?.length ?? 0
              );

              const historyMessages: TranscriptMessage[] = [];

              for (let i = 0; i < maxLen; i++) {
                const q = history.interviewer?.find((m) => m.order === i);
                const a = history.candidate?.find((m) => m.order === i);
                if (q) {
                  historyMessages.push({
                    id: q.id ?? crypto.randomUUID(),
                    role: "assistant",
                    content: q.text,
                    timestamp: new Date(q.dateCreated).getTime(),
                  });
                }
                if (a) {
                  historyMessages.push({
                    id: crypto.randomUUID(),
                    role: "user",
                    content: a.text,
                    timestamp: new Date(a.dateCreated).getTime(),
                  });
                }
              }

              setMessages(historyMessages);

              // Speak the last assistant message if there are no user answers yet
              const lastAssistant = historyMessages.findLast((m) => m.role === "assistant");
              const hasUserMessages = historyMessages.some((m) => m.role === "user");
              if (lastAssistant && !hasUserMessages) {
                ttsRef.current.speak(lastAssistant.content, selectedVoiceRef.current);
              }
            } catch {
              // History endpoint failed — use the first AI turn from status.conversation
              const firstAI = status.conversation.find(
                (e) => (e as { role?: string }).role === "assistant"
              ) as { role: string; content: string } | undefined;

              if (firstAI?.content) {
                setMessages([
                  {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: firstAI.content,
                    timestamp: Date.now(),
                  },
                ]);
                ttsRef.current.speak(firstAI.content, selectedVoiceRef.current);
              }
            }
          } catch {
            // Ignore transient poll errors
          }
        }, 2000);
      } catch (err) {
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `⚠️ Không thể khởi tạo phiên: ${getErrorMessage(err)}`,
            timestamp: Date.now(),
          },
        ]);
        setSessionReady(true);
      }
    },
    [agora]
  );

  // ── User answer → streamed AI reply ───────────────────────────────────────
  // Stored in a ref so useSpeechToText always calls the latest version
  // without rebuilding the hook on every render.

  const handleFinalTranscriptImpl = useRef(async (text: string) => {
  console.log("[STT] transcript received:", text);
  console.log("[STT] isLoadingRef:", isLoadingRef.current);
  console.log("[STT] sessionIdRef:", sessionIdRef.current);
  console.log("[STT] sessionReady state — check UI indicator");
    if (!text.trim()) {
      console.warn("[STT] bailed: empty transcript");
      return;
    }
    if (isLoadingRef.current) {
      console.warn("[STT] bailed: already loading");
      return;
    }
    if (!sessionIdRef.current) {
      console.warn("[STT] bailed: no session id");
      return;
    }

    const sessionId = sessionIdRef.current;
    const assistantId = crypto.randomUUID();

    // Add user message and empty assistant placeholder in a single update
    // so assistantId is stable before any streaming updates arrive.
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text, timestamp: Date.now() },
      { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
    ]);

    isLoadingRef.current = true;
    setIsLoading(true);

    let fullText = "";

    try {
      console.log("[STT] streaming answer for session:", sessionId);

      for await (const token of streamNextQuestion(sessionId, text, BACKEND_BASE)) {
        fullText += token;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: fullText } : msg
          )
        );
      }

      console.log("[STT] stream done, length:", fullText.length);

      if (fullText.trim()) {
        ttsRef.current.speak(fullText, selectedVoiceRef.current);
      }
    } catch (err) {
      console.error("[STT] streaming error:", err);
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
  });

  // Stable wrapper — identity never changes, so useSpeechToText won't re-subscribe
  const stableHandleTranscript = useCallback((text: string) => {
    handleFinalTranscriptImpl.current(text);
  }, []);

  const stt = useSpeechToText(stableHandleTranscript);

  // ── Leave ──────────────────────────────────────────────────────────────────

  const handleLeave = async () => {
    stt.stopListening();
    tts.stop();
    if (pollRef.current) clearInterval(pollRef.current);

    if (sessionIdRef.current) {
      try {
        await interviewService.evaluate(sessionIdRef.current);
      } catch {
        // Non-fatal
      }
    }

    await agora.leave();
    setMessages([]);
    setSessionReady(false);
    sessionIdRef.current = "";
    isLoadingRef.current = false;
    setIsLoading(false);
  };

  // ── Pre-join screen ────────────────────────────────────────────────────────

  if (!agora.joined) {
    return (
      <JoinForm
        onJoin={(appId, channel, token) =>
          handleJoin({
            appId,
            channel,
            token,
            cvText: "",
            jobPosition: "",
            jobDescription: "",
            companyDescription: "",
          })
        }
      />
    );
  }

  // ── In-call screen ─────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-black text-white">


      {/* Main */}
      <main className="flex flex-1 overflow-hidden">

        {/* Video area */}
        <section className="flex flex-col flex-1 p-4 gap-4">

          {/* Video grid */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            <VideoTile
              videoTrack={agora.localVideoTrack}
              isLocal
              isMuted={agora.isVideoMuted}
              label="You"
              isSpeaking={stt.isListening && !stt.isTranscribing}
            />

            {agora.remoteUsers.map((user) => (
              <VideoTile
                key={user.uid}
                videoTrack={user.videoTrack}
                uid={user.uid}
                isMuted={!user.hasAudio}
                isSpeaking={false}
              />
            ))}

            {agora.remoteUsers.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500">
                <div className="w-6 h-6 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm">Waiting for others to join…</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">

            {/* Mic toggle */}
            <button
              onClick={agora.toggleAudio}
              aria-label={agora.isAudioMuted ? "Unmute microphone" : "Mute microphone"}
              className={`p-3 rounded-full border transition ${
                agora.isAudioMuted
                  ? "bg-red-500 border-red-500"
                  : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
              }`}
            >
              {agora.isAudioMuted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M12 1a3 3 0 0 1 3 3v4m-6 3a3 3 0 0 0 5.66 1.5M9 9v3a3 3 0 0 0 .47 1.62" />
                  <path d="M17 16.5A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.17 1.5M12 19v4M8 23h8" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                </svg>
              )}
            </button>

            {/* Camera toggle */}
            <button
              onClick={agora.toggleVideo}
              aria-label={agora.isVideoMuted ? "Enable camera" : "Disable camera"}
              className={`p-3 rounded-full border transition ${
                agora.isVideoMuted
                  ? "bg-red-500 border-red-500"
                  : "bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
              }`}
            >
              {agora.isVideoMuted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M15 10l4.55-2.27A1 1 0 0 1 21 8.68v6.64a1 1 0 0 1-1.45.9L15 14M3 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H3z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 10l4.55-2.27A1 1 0 0 1 21 8.68v6.64a1 1 0 0 1-1.45.9L15 14" />
                  <rect x="1" y="5" width="15" height="14" rx="2" />
                </svg>
              )}
            </button>

            {/* AI listen toggle */}
            <button
              onClick={() =>
                stt.isListening ? stt.stopListening() : stt.startListening()
              }
              disabled={stt.isTranscribing || !sessionReady}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                stt.isListening
                  ? "bg-green-500 text-black"
                  : "bg-neutral-800 hover:bg-neutral-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {stt.isTranscribing ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="w-2 h-2 bg-current rounded-full" />
              )}
              {stt.isTranscribing
                ? "Whisper…"
                : stt.isListening
                ? "Listening"
                : sessionReady
                ? "AI Listen"
                : "Preparing…"}
            </button>

            {/* Stop TTS */}
            {tts.isSpeaking && (
              <button
                onClick={tts.stop}
                aria-label="Stop speaking"
                className="p-3 rounded-full bg-yellow-500 text-black transition hover:bg-yellow-400"
              >
                ■
              </button>
            )}

            {/* Leave */}
            <button
              onClick={handleLeave}
              className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 font-medium transition"
            >
              Leave
            </button>
          </div>
        </section>

        {/* Transcript sidebar */}
        <aside className="w-[380px] border-l border-neutral-800 bg-neutral-950">
          <TranscriptPanel
            messages={messages}
            interimTranscript={stt.interimTranscript}
            isListening={stt.isListening}
            isSpeaking={tts.isSpeaking}
            isLoading={isLoading || stt.isTranscribing}
          />
        </aside>
      </main>
    </div>
  );
}