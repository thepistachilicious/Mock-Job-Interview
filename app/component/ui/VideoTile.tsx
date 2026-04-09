/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";

interface VideoTileProps {
  videoTrack?: any;
  isLocal?:    boolean;
  isMuted?:    boolean;   // true = video is off (show avatar)
  uid?:        number | string;
  label?:      string;
  isSpeaking?: boolean;
}

export default function VideoTile({
  videoTrack,
  isLocal   = false,
  isMuted   = false,
  uid,
  label,
  isSpeaking,
}: VideoTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    console.log("[VideoTile] effect fired", {
      hasTrack: !!videoTrack,
      isMuted,
      elSize: el ? `${el.offsetWidth}x${el.offsetHeight}` : "no el",
      trackState: videoTrack?.getTrackLabel?.() ?? videoTrack?.enabled,
    });

    if (!el || !videoTrack || isMuted) return;

    try {
      videoTrack.play(el);
    } catch (e) {
      console.error("[VideoTile] play error:", e);
    }

    return () => {
      try { videoTrack.stop(); } catch {}
    };
  }, [videoTrack, isMuted]);

  // Show avatar only when there's no track OR video is explicitly muted
  const showAvatar = !videoTrack || isMuted;

  return (
    <div className="relative w-full h-full min-h-[160px]">
      <div
        className={`absolute inset-0 rounded-2xl overflow-hidden bg-neutral-900 border transition-all duration-200 ${
          isSpeaking
            ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            : "border-neutral-800"
        }`}
      >
        {/* 
          Video container — always in the DOM so Agora has a stable element.
          Hidden via opacity when avatar is showing so layout doesn't shift.
        */}
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full"
          style={{
            background: "#000",
            opacity: showAvatar ? 0 : 1,
            transition: "opacity 0.2s",
          }}
        />

        {/* Avatar fallback */}
        {showAvatar && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-10">
            <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-semibold text-white select-none">
              {isLocal ? "You" : (uid?.toString().slice(-2) ?? "??")}
            </div>
          </div>
        )}

        {/* Bottom meta bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/70 to-transparent z-20">
          <span className="text-xs text-white drop-shadow">
            {label ?? (isLocal ? "You" : `User ${uid}`)}
          </span>

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
        </div>

        {/* Muted badge */}
        {isMuted && (
          <div className="absolute top-2 right-2 bg-red-500 p-1 rounded-full z-20">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}