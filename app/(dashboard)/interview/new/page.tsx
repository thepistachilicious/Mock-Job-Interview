"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { interviewService, StartInterviewRequest, getErrorMessage } from "@/api/interviewService";
import { useInterviewStore } from "@/store/useInterviewStore";

function Spinner({ size = 16, color = "#22c55e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * /interview/new
 *
 * Immediately calls the backend to create an interview session, then
 * redirects to /interview/[id]/device-check so that page always has a real ID.
 */
export default function InterviewNewPage() {
  const router  = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const cvText        = useInterviewStore((s) => s.cvText);
  const jobPosition   = useInterviewStore((s) => s.jobPosition);
  const jdDescription = useInterviewStore((s) => s.jdDescription);
  const company       = useInterviewStore((s) => s.Company);

  useEffect(() => {
    if (!cvText) { router.replace("/interview/upload-cv"); return; }
    if (started.current) return;
    started.current = true;

    const payload: StartInterviewRequest = {
      cv_text:             cvText,
      job_position:        jobPosition   || "Software Engineer",
      job_description:     jdDescription || "",
      company_description: company       || "",
    };

    interviewService
      .startInterview(payload)
      .then((res) => {
        // Redirect to device-check with the real session ID
        router.replace(`/interview/${res.session_id}/device-check`);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      {error ? (
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#f43f5e]/10 border border-[#f43f5e]/30 flex items-center justify-center text-3xl">⚠️</div>
          <h2 className="text-white font-bold text-lg">Không thể tạo phiên</h2>
          <p className="text-[#64748b] text-sm">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-2 px-6 py-3 rounded-xl border border-[#1e293b] text-[#64748b] text-sm hover:border-[#334155] hover:text-white transition"
          >
            Quay lại
          </button>
        </div>
      ) : (
        <>
          <Spinner size={40} />
          <div className="text-center">
            <p className="text-white font-semibold">Đang khởi tạo phiên phỏng vấn…</p>
            <p className="text-[#64748b] text-sm mt-1">Vui lòng chờ trong giây lát</p>
          </div>
        </>
      )}
    </div>
  );
}