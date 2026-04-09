"use client";

import { useEffect, useRef, useState } from "react";

interface LocalCameraProps {
  isSpeaking?: boolean;
  label?: string;
}

export default function LocalCamera({ isSpeaking, label = "Bạn" }: LocalCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState(false);

  // Start camera on mount
  useEffect(() => {
    let active = true;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => setError(true));

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // Toggle camera on/off
  const toggleCamera = () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setEnabled(track.enabled);
  };

  return (
    <div className="relative w-full h-full min-h-[160px]">
      <div
        className={`absolute inset-0 rounded-2xl overflow-hidden bg-neutral-900 border transition-all duration-200 ${
          isSpeaking
            ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            : "border-[#1e293b]"
        }`}
      >
        {/* Native video element — no library needed */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: enabled && !error ? "block" : "none" }}
        />

        {/* Avatar when off or errored */}
        {(!enabled || error) && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-10">
            {error ? (
              <div className="flex flex-col items-center gap-2 text-center px-4">
                <span className="text-2xl">📷</span>
                <p className="text-xs text-neutral-500">Camera không khả dụng</p>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-semibold text-white select-none">
                {label.slice(0, 2)}
              </div>
            )}
          </div>
        )}

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/70 to-transparent z-20">
          <span className="text-xs text-white drop-shadow">{label}</span>

          <div className="flex items-center gap-2">
            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="flex items-end gap-[2px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-[3px] bg-green-400 rounded-sm animate-bounce"
                    style={{ height: "12px", animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            )}

            {/* Camera toggle button */}
            {!error && (
              <button
                onClick={toggleCamera}
                title={enabled ? "Tắt camera" : "Bật camera"}
                className={`p-1 rounded-lg transition ${
                  enabled
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-red-500/80 text-white"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {enabled ? (
                    <>
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </>
                  ) : (
                    <>
                      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" />
                      <path d="M23 7l-7 5 7 5V7z" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}