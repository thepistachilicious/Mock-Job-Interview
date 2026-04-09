/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useCallback } from "react";

export interface TextToSpeechState {
  isSpeaking: boolean;
  supported: boolean;
  speak: (text: string, voice?: string) => Promise<void>;
  stop: () => void;
}

export function useTextToSpeech(): TextToSpeechState {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const supported = typeof window !== "undefined";

  const speak = useCallback(async (text: string, voice: string = "alloy") => {
    if (!text.trim()) return;

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsSpeaking(true);
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`TTS error ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("OpenAI TTS failed:", err);
      }
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, supported, speak, stop };
}