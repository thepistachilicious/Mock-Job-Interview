"use client";

import { useEffect, useRef } from "react";
import { TranscriptMessage } from "@/app/(dashboard)/interview/[id]/page";

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  interimTranscript: string;
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
}

export default function TranscriptPanel({
  messages,
  interimTranscript,
  isListening,
  isSpeaking,
  isLoading,
}: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interimTranscript]);

    return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950">
        <span className="text-sm font-semibold text-white">Transcript</span>

        <div className="flex items-center gap-2">
            {isListening && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Đang nghe
            </span>
            )}

            {isLoading && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-400">
                <span className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                Đang xử lý
            </span>
            )}

            {isSpeaking && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400">
                <span className="flex gap-[2px]">
                {[0, 1, 2].map((i) => (
                    <span
                    key={i}
                    className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                    />
                ))}
                </span>
                Đang nói
            </span>
            )}
        </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Empty */}
        {messages.length === 0 && !interimTranscript && (
            <div className="flex flex-col items-center justify-center text-center text-neutral-500 mt-10">
            <svg
                width="32" height="32" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5"
                className="opacity-30 mb-3"
            >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <p className="text-sm">Bắt đầu nói để bắt đầu cuộc phỏng vấn</p>
            </div>
        )}

        {/* Messages list */}
        {messages.map((msg) => (
            <div
            key={msg.timestamp}
            className={`flex flex-col max-w-[80%] ${
                msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
            >
            <span className="text-xs text-neutral-500 mb-1">
                {msg.role === "user" ? "Bạn" : "AI"}
            </span>

            <div
                className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                    ? "bg-green-500 text-black"
                    : "bg-neutral-800 text-white"
                }`}
            >
                {msg.content}
            </div>

            <span className="text-[10px] text-neutral-600 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                })}
            </span>
            </div>
        ))}

        {/* Interim speech */}
        {interimTranscript && (
            <div className="flex flex-col max-w-[80%] ml-auto items-end">
            <span className="text-xs text-neutral-500 mb-1">Bạn</span>

            <div className="px-4 py-2 rounded-2xl bg-green-500/80 text-black text-sm flex items-center">
                {interimTranscript}
                <span className="ml-1 w-[6px] h-4 bg-black animate-pulse" />
            </div>
            </div>
        )}

        <div ref={bottomRef} />
        </div>
    </div>
    );
}