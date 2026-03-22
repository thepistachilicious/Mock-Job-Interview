/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } as const },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function Spinner({ size = 16, color = "#22c55e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function DeviceCheckPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [camOk,    setCamOk]    = useState<boolean | null>(null);
  const [micOk,    setMicOk]    = useState<boolean | null>(null);
  const [netOk,    setNetOk]    = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const runChecks = useCallback(async () => {
    setChecking(true);
    setCamOk(null);
    setMicOk(null);
    setNetOk(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCamOk(true);
      setMicOk(true);
    } catch {
      setCamOk(false);
      setMicOk(false);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(4000) });
      setNetOk(res.ok);
    } catch {
      setNetOk(false);
    }

    setChecking(false);
  }, []);

  useEffect(() => {
    runChecks();
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [runChecks]);

  const allOk = camOk && micOk;

  const checks = [
    { label: "Camera",              status: camOk, icon: "📷" },
    { label: "Microphone",          status: micOk, icon: "🎙️" },
    { label: "Backend connection",  status: netOk, icon: "🌐", advisory: true },
  ];

  const handleStart = () => {
    // Stop preview stream before entering interview
    streamRef.current?.getTracks().forEach((t) => t.stop());
    router.push(`/interview/${sessionId}`);
  };

  const handleBack = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    router.push("/interview/upload-jd");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Body */}
      <div className="flex-1 pt-[57px] px-4 py-8 flex items-start justify-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl pt-8 space-y-5"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-4 py-1.5 rounded-full text-[#3b82f6] text-xs font-semibold mb-4 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
              BƯỚC 1 / 2 — KIỂM TRA THIẾT BỊ
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              Kiểm tra trước<br />
              <span className="text-[#3b82f6]">khi bắt đầu</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Camera preview */}
            <motion.div
              variants={fadeUp}
              className="bg-[#0b1120] border border-[#1e293b] rounded-2xl overflow-hidden aspect-video relative"
            >
              <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
              {camOk === false && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0b1120] text-[#f43f5e] text-sm font-medium">
                  Camera không khả dụng
                </div>
              )}
              {camOk === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0b1120]">
                  <Spinner size={28} color="#3b82f6" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-xs text-white">
                Preview
              </div>
            </motion.div>

            {/* Status panel */}
            <motion.div variants={fadeUp} className="bg-[#0b1120] border border-[#1e293b] rounded-2xl p-6 space-y-4">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-2">
                Trạng thái hệ thống
              </p>
              {checks.map(({ label, status, icon, advisory }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <span className="flex-1 text-sm text-[#e2e8f0]">
                    {label}{advisory ? " (tuỳ chọn)" : ""}
                  </span>
                  {status === null ? (
                    <Spinner size={14} color="#64748b" />
                  ) : status ? (
                    <span className="flex items-center gap-1 text-[#22c55e] text-xs font-semibold">
                      <CheckIcon size={13} /> Sẵn sàng
                    </span>
                  ) : (
                    <span className="text-[#f43f5e] text-xs font-semibold">
                      {advisory ? "Không kết nối" : "Lỗi"}
                    </span>
                  )}
                </div>
              ))}

              <button
                onClick={runChecks}
                disabled={checking}
                className="w-full mt-4 py-2.5 rounded-xl border border-[#1e293b] text-[#64748b] text-sm hover:border-[#334155] hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {checking ? <Spinner size={14} /> : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                )}
                Kiểm tra lại
              </button>
            </motion.div>
          </div>

          {/* Session info pill */}
          <motion.div variants={fadeUp} className="bg-[#0b1120] border border-[#1e293b] rounded-2xl p-5 flex items-center gap-4">
            <div className="text-2xl">🎯</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">Phiên phỏng vấn đã sẵn sàng</p>
              <p className="text-[#64748b] text-xs mt-0.5 font-mono">
                Session: <span className="text-[#a78bfa]">{sessionId}</span>
              </p>
            </div>
          </motion.div>

          {/* CTA row */}
          <motion.div variants={fadeUp} className="flex gap-3">
            <button
              onClick={handleBack}
              className="px-5 py-4 rounded-2xl border border-[#1e293b] text-[#64748b] font-semibold hover:border-[#334155] hover:text-white transition flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <button
              onClick={handleStart}
              disabled={!allOk || checking}
              className="flex-1 py-4 bg-[#22c55e] text-black font-bold text-base rounded-2xl hover:bg-[#16a34a] hover:shadow-[0_0_28px_rgba(34,197,94,0.3)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {checking ? (
                <><Spinner size={18} color="#000" /> Đang kiểm tra…</>
              ) : (
                <>
                  Bắt đầu phỏng vấn
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}