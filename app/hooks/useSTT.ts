"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface SpeechToTextState {
  isListening: boolean;
  isTranscribing: boolean;
  transcript: string;
  interimTranscript: string;
  supported: boolean;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

const SILENCE_TIMEOUT_MS = 2000;
const MIN_RECORD_MS = 800;
const MIN_BLOB_SIZE = 8000;
const RMS_VOICE_THRESHOLD = 0.03;

const WHISPER_HALLUCINATIONS = new Set([
  "thank you", "thank you.", "thanks", "thanks.", "bye", "bye.",
  "goodbye", "goodbye.", "you", "you.", ".", "..", "...", "okay",
  "okay.", "ok", "ok.", "see you", "see you.", "i'll be back",
  "i'll be back.", "go to", "beadaholique", "beadaholique.com",
]);

function isJunkTranscription(text: string): boolean {
  if (!text || text.length < 3) return true;
  if (text.replace(/[^a-zA-Z]/g, "").length < 3) return true;
  const words = text.trim().split(/\s+/);
  if (words.length === 1 && words[0].length < 4) return true;
  const lower = text.toLowerCase().trim();
  if (WHISPER_HALLUCINATIONS.has(lower)) return true;
  return false;
}

export function useSpeechToText(
  onFinalTranscript?: (text: string) => void
): SpeechToTextState {
  // ✅ THE FIX: always points to the latest callback, never stale
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const supported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia;

  // ✅ No longer depends on onFinalTranscript — reads from ref instead
  const transcribeBlob = useCallback(async (blob: Blob) => {
    if (blob.size < MIN_BLOB_SIZE) {
      console.log("[STT] Blob too small, skipping:", blob.size);
      return;
    }

    setIsTranscribing(true);
    setInterimTranscript("transcribing…");

    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");
      formData.append("model", "whisper-1");
      formData.append("language", "en");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("[STT] Transcribe error:", res.status, body);
        throw new Error(`Transcribe error ${res.status}`);
      }

      const data = await res.json();
      const text: string = data.text?.trim() || "";

      if (isJunkTranscription(text)) {
        console.log("[STT] Filtered junk:", JSON.stringify(text));
        setInterimTranscript("");
        return;
      }

      console.log("[STT] Final transcript:", text);
      setTranscript((prev) => prev + (prev ? " " : "") + text);
      setInterimTranscript("");

      // ✅ Always calls the LATEST callback via ref
      onFinalTranscriptRef.current?.(text);
    } catch (err) {
      console.error("[STT] Whisper transcription failed:", err);
      setInterimTranscript("");
    } finally {
      setIsTranscribing(false);
    }
  }, []); // ✅ empty deps — stable forever, reads fresh callback via ref

  const stopRecordingChunk = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
  }, []);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      stopRecordingChunk();
    }, SILENCE_TIMEOUT_MS);
  }, [stopRecordingChunk]);

  const monitorSilence = useCallback(
    (analyser: AnalyserNode) => {
      const data = new Uint8Array(analyser.fftSize);
      const check = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        if (rms > RMS_VOICE_THRESHOLD) resetSilenceTimer();
        animFrameRef.current = requestAnimationFrame(check);
      };
      animFrameRef.current = requestAnimationFrame(check);
    },
    [resetSilenceTimer]
  );

  const startListening = useCallback(async () => {
    if (!supported || isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;
      monitorSilence(analyser);

      const startNewChunk = () => {
        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm",
        });

        chunksRef.current = [];
        startTimeRef.current = Date.now();

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const duration = Date.now() - startTimeRef.current;
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });

          if (duration >= MIN_RECORD_MS && blob.size >= MIN_BLOB_SIZE) {
            await transcribeBlob(blob);
          } else {
            console.log(`[STT] Skipping chunk — duration: ${duration}ms, size: ${blob.size}B`);
          }

          if (mediaRecorderRef.current?.stream?.active) {
            startNewChunk();
          }
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        resetSilenceTimer();
      };

      startNewChunk();
      setIsListening(true);
    } catch (err) {
      console.error("[STT] Could not start microphone:", err);
    }
  }, [supported, isListening, monitorSilence, transcribeBlob, resetSilenceTimer]);

  const stopListening = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    const recorder = mediaRecorderRef.current;
    if (recorder) {
      recorder.stream.getTracks().forEach((t) => t.stop());
      if (recorder.state !== "inactive") recorder.stop();
      mediaRecorderRef.current = null;
    }

    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    isTranscribing,
    transcript,
    interimTranscript,
    supported,
    startListening,
    stopListening,
    clearTranscript,
  };
}