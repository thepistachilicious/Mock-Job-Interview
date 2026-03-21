"use client";
import React, { useState, useEffect, useRef } from "react";

export default function OngoingInterview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentQuestionText, setCurrentQuestionText] = useState(
    "Vui lòng giới thiệu ngắn gọn về bản thân và kinh nghiệm làm việc của bạn.",
  );
  const [timer, setTimer] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // --- START MEDIA FUNCTION (Chỉ 1 lần) ---
  const startMedia = async () => {
    try {
      // Stop old tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: camOn,
        audio: micOn,
      });

      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      console.error("Media error:", err);
      alert("Không thể mở Camera hoặc Mic. Vui lòng kiểm tra quyền truy cập!");
    }
  };

  // --- EFFECT: start media khi camOn hoặc micOn thay đổi ---
  useEffect(() => {
    startMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [camOn, micOn]);

  // --- EFFECT: enable/disable tracks mà không tạo stream mới ---
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = camOn));
      streamRef.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = micOn));
    }
  }, [camOn, micOn]);

  return (
    <div className="h-screen w-full bg-[#0b1120] text-white flex flex-col font-sans overflow-hidden relative">
      <header className="w-full flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-md border-b border-[#334155]/50 relative z-40">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-[#22c55e] rounded-full"></div>
          <h1 className="text-lg font-bold tracking-tight">
            Practice Your <span className="text-[#22c55e]">Interview</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-black/60 border border-[#334155] px-4 py-1.5 rounded-full">
          <div className="flex items-center gap-2 text-[#94a3b8] text-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-medium text-white w-10 text-center">
              {formatTime(timer)}
            </span>
          </div>
          <div className="h-4 w-px bg-[#334155]"></div>
          <div className="text-sm font-medium text-white">
            Câu{" "}
            <span className="text-[#22c55e] font-bold mx-0.5">
              {currentQuestionNumber}
            </span>{" "}
            / {totalQuestions}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
        <div className="absolute bottom-6 right-6 w-48 md:w-56 aspect-video bg-black border border-[#334155] rounded-xl shadow-xl z-20 overflow-hidden transition-all duration-300">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${camOn ? "block" : "hidden"}`}
          />
          {!camOn && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-1.5">
              <span className="text-[10px] font-medium">Camera Off</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md border border-[#334155] px-6 py-2.5 rounded-full z-30 shadow-lg">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`p-3 rounded-full transition-all duration-300 ${
              micOn
                ? "bg-[#1e293b] text-white hover:bg-gray-700"
                : "bg-red-500 text-black hover:bg-red-600"
            }`}
            title={micOn ? "Tắt Mic" : "Bật Mic"}
          >
            Mic
          </button>
          <button
            onClick={() => setCamOn(!camOn)}
            className={`p-3 rounded-full transition-all duration-300 ${
              camOn
                ? "bg-[#1e293b] text-white hover:bg-gray-700"
                : "bg-red-500 text-black hover:bg-red-600"
            }`}
            title={camOn ? "Tắt Camera" : "Bật Camera"}
          >
            Cam
          </button>
        </div>
      </main>
    </div>
  );
}
