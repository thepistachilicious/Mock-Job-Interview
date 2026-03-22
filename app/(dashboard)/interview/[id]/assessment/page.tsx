"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  interviewService,
  InterviewEvaluationResponse,
} from "@/api/interviewService";

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: "easeInOut" as const },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  return "#f43f5e";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-[#22c55e]/10 border-[#22c55e]/20";
  if (score >= 60) return "bg-[#f59e0b]/10 border-[#f59e0b]/20";
  return "bg-[#f43f5e]/10 border-[#f43f5e]/20";
}

function recommendationLabel(rec: string) {
  const r = rec?.toLowerCase() ?? "";
  if (r.includes("strong") || r.includes("highly")) return { text: "Rất Tiềm Năng", color: "#22c55e", bg: "bg-[#22c55e]/10 border-[#22c55e]/30" };
  if (r.includes("consider") || r.includes("good")) return { text: "Tiềm Năng (Good Fit)", color: "#22c55e", bg: "bg-[#22c55e]/10 border-[#22c55e]/30" };
  if (r.includes("maybe") || r.includes("average")) return { text: "Cần Xem Xét Thêm", color: "#f59e0b", bg: "bg-[#f59e0b]/10 border-[#f59e0b]/30" };
  return { text: rec || "Chờ đánh giá", color: "#64748b", bg: "bg-[#1e293b] border-[#334155]" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const color = scoreColor(score);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke="#1e293b" strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="text-center z-10">
        <span className="text-4xl font-black text-white">{score}</span>
        <span className="text-sm text-[#94a3b8] block -mt-1">/ 100</span>
      </div>
    </div>
  );
}

function SkillBar({
  label,
  score,
  index,
}: {
  label: string;
  score: number;
  index: number;
}) {
  const color = scoreColor(score);
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-[#e2e8f0]">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="w-full bg-[#1e293b] rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-2 rounded-full relative"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: 0.2 + index * 0.06, duration: 0.7, ease: "easeOut" }}
        >
          <div className="absolute top-0 right-0 bottom-0 w-3 bg-white/20 rounded-full blur-[2px]" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-[#1e293b] rounded-xl ${className}`} />;
}

function LoadingState() {
  return (
    <div className="max-w-5xl w-full space-y-8 mt-4 md:mt-10">
      <div className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>
        <div className="w-40 h-40 rounded-full animate-pulse bg-[#1e293b]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 space-y-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
        <div className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
      <div className="w-20 h-20 rounded-full bg-[#f43f5e]/10 border-2 border-[#f43f5e]/30 flex items-center justify-center text-4xl">
        ⚠️
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Không thể tải báo cáo</h2>
        <p className="text-[#64748b] text-sm mt-2 max-w-sm">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-[#22c55e] text-black font-bold rounded-full hover:bg-[#16a34a] transition"
      >
        Thử lại
      </button>
    </div>
  );
}

// ─── Main Assessment Page ─────────────────────────────────────────────────────

export default function AssessmentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sessionId = params?.id ?? "";

  const [report, setReport] = useState<InterviewEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    if (!sessionId) {
      setError("Không tìm thấy session ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await interviewService.getReport(sessionId);
      setReport(data);
    } catch {
      // getReport failed — try evaluate() first then getReport() again
      try {
        await interviewService.evaluate(sessionId);
        const data = await interviewService.getReport(sessionId);
        setReport(data);
      } catch (err2) {
        setError(
          err2 instanceof Error
            ? err2.message
            : "Đã xảy ra lỗi khi tải báo cáo. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ── Build flat skill list from report ─────────────────────────────────────
  const skillMetrics = report
    ? [
        { label: "OOP", score: report.technical_skills.oop },
        { label: "Thuật toán (Algorithms)", score: report.technical_skills.algorithms },
        { label: "Mạng máy tính (Networking)", score: report.technical_skills.networking },
        { label: "Thiết kế hệ thống (System Design)", score: report.technical_skills.system_design },
        { label: "Technology Stack", score: report.technical_skills.technology_stack },
        { label: "Độ phức tạp dự án", score: report.project_experience.project_complexity },
        { label: "Vai trò trong dự án", score: report.project_experience.role_in_project },
        { label: "Giải quyết vấn đề", score: report.project_experience.problem_solving },
        { label: "Văn hoá công ty", score: report.cultural_fit.company_culture_fit },
        { label: "Làm việc nhóm", score: report.cultural_fit.teamwork },
        { label: "Giao tiếp (Communication)", score: report.cultural_fit.communication },
      ]
    : [];

  const categoryAverages = report
    ? [
        { label: "Kỹ năng chuyên môn", score: report.technical_skills.average },
        { label: "Kinh nghiệm dự án", score: report.project_experience.average },
        { label: "Phù hợp văn hoá", score: report.cultural_fit.average },
      ]
    : [];

  const rec = report ? recommendationLabel(report.recommendation) : null;
  const overallScore = report?.overall_match_score ?? 0;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-4 md:p-8 font-sans text-white overflow-y-auto">
      <div className="max-w-5xl w-full space-y-8 mt-4 md:mt-10">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchReport} />
        ) : report ? (
          <>
            {/* ── 1. Header ───────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden gap-8"
            >
              <div className="absolute top-1/2 right-0 w-72 h-72 opacity-10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${scoreColor(overallScore)}, transparent)` }}
              />

              <div className="text-center md:text-left z-10 flex-1">
                <p className="text-[#64748b] text-xs font-semibold uppercase tracking-widest mb-2">
                  {sessionId.slice(0, 12)}…
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                  Báo cáo{" "}
                  <span className="text-[#22c55e]">Đánh giá AI</span>
                </h1>
                <p className="text-[#94a3b8] text-base mb-1">
                  Ứng viên:{" "}
                  <span className="text-white font-semibold">
                    {report.candidate_name || "—"}
                  </span>
                </p>
                <p className="text-[#94a3b8] text-base mb-5">
                  Vị trí:{" "}
                  <span className="text-white font-semibold">
                    {report.job_position}
                  </span>
                </p>

                {rec && (
                  <div
                    className={`inline-flex items-center gap-2 border px-4 py-2 rounded-full font-semibold text-sm ${rec.bg}`}
                    style={{ color: rec.color }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    {rec.text}
                  </div>
                )}

                {report.summary && (
                  <p className="text-[#64748b] text-sm mt-4 max-w-md leading-relaxed">
                    {report.summary}
                  </p>
                )}
              </div>

              <div className="shrink-0 z-10 flex flex-col items-center gap-3">
                <ScoreRing score={overallScore} />
                <p className="text-[#64748b] text-xs font-semibold uppercase tracking-widest">
                  Tổng điểm
                </p>
              </div>
            </motion.div>

            {/* ── 2. Category averages ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categoryAverages.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className={`border rounded-2xl p-5 flex items-center gap-4 ${scoreBg(cat.score)}`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${scoreColor(cat.score)}20` }}
                  >
                    {i === 0 ? "🧠" : i === 1 ? "🛠️" : "🤝"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#94a3b8] text-xs font-semibold truncate">{cat.label}</p>
                    <p className="text-2xl font-black" style={{ color: scoreColor(cat.score) }}>
                      {cat.score.toFixed(1)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── 3. Skill breakdown + Feedback ────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: all skill bars */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-7">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h2 className="text-xl font-bold text-white">Chỉ số kỹ năng chi tiết</h2>
                </div>
                <div className="space-y-5">
                  {skillMetrics.map((m, i) => (
                    <SkillBar key={m.label} label={m.label} score={m.score} index={i} />
                  ))}
                </div>
              </motion.div>

              {/* Right: strengths + improvements */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 shadow-lg flex flex-col gap-5"
              >
                <div className="flex items-center gap-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <h2 className="text-xl font-bold text-white">Nhận xét chi tiết</h2>
                </div>

                {/* Strengths */}
                {report.strengths?.length > 0 && (
                  <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-2xl p-5 flex-1">
                    <h3 className="text-[#22c55e] font-bold mb-3 flex items-center gap-2 text-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      Điểm mạnh nổi bật
                    </h3>
                    <ul className="space-y-2.5">
                      {report.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#cbd5e1] leading-relaxed">
                          <span className="text-[#22c55e] mt-0.5 shrink-0">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas for improvement */}
                {report.areas_for_improvement?.length > 0 && (
                  <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-2xl p-5 flex-1">
                    <h3 className="text-[#f59e0b] font-bold mb-3 flex items-center gap-2 text-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      Cần cải thiện
                    </h3>
                    <ul className="space-y-2.5">
                      {report.areas_for_improvement.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#cbd5e1] leading-relaxed">
                          <span className="text-[#f59e0b] mt-0.5 shrink-0">•</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendation raw text */}
                {report.recommendation && (
                  <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4">
                    <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-1">
                      Khuyến nghị
                    </p>
                    <p className="text-sm text-[#e2e8f0] leading-relaxed">
                      {report.recommendation}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── 4. Actions ───────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 pb-10"
            >
              <button
                onClick={() => router.push("/interview/upload-cv")}
                className="flex-1 py-4 bg-[#22c55e] text-black font-bold text-lg rounded-full hover:bg-[#1ea34d] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-[0.98]"
              >
                Làm lại phỏng vấn
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-4 bg-transparent border-2 border-[#334155] text-white font-bold text-lg rounded-full hover:bg-[#1e293b] hover:border-[#475569] transition-all active:scale-[0.98]"
              >
                Về trang chủ
              </button>
            </motion.div>
          </>
        ) : null}
      </div>
    </div>
  );
}