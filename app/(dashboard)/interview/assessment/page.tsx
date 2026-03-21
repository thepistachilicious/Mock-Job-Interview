"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";

// Score is 0–10 from API → multiply by 10 for percentage display
const toPercent = (score: number) => Math.round(score * 10);

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = toPercent(score);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[#e2e8f0]">{label}</span>
        <span className="text-sm font-bold text-white">{pct}/100</span>
      </div>
      <div className="w-full bg-[#1e293b] rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#16a34a] to-[#22c55e] h-2.5 rounded-full relative transition-all duration-700"
          style={{ width: `${pct}%` }}
        >
          <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 rounded-full blur-[2px]" />
        </div>
      </div>
    </div>
  );
}

export default function AssessmentResult() {
  const router = useRouter();
  const report = useInterviewStore((s) => s.evaluationReport);

  // Fallback to mock if report not yet available (e.g. user refreshed)
  const overallScore = report ? toPercent(report.overall_match_score) : 0;

  const getRecommendationBadge = (rec: string) => {
    const lower = rec.toLowerCase();
    if (lower.includes("strong") || lower.includes("highly")) {
      return { label: "Strong Fit", color: "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30" };
    }
    if (lower.includes("good") || lower.includes("potential")) {
      return { label: "Good Fit", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
    }
    if (lower.includes("consider") || lower.includes("partial")) {
      return { label: "Partial Fit", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" };
    }
    return { label: "Needs Review", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" };
  };

  const badge = report
    ? getRecommendationBadge(report.recommendation)
    : { label: "Evaluating...", color: "text-[#94a3b8] bg-[#1e293b] border-[#334155]" };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-4 md:p-8 font-sans text-white overflow-y-auto">
      <div className="max-w-5xl w-full space-y-8 mt-4 md:mt-10">

        {/* ── 1. HEADER & OVERALL SCORE ── */}
        <div className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-[#22c55e] opacity-[0.06] rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

          <div className="text-center md:text-left z-10 mb-8 md:mb-0 max-w-xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              AI <span className="text-[#22c55e]">Evaluation</span> Report
            </h1>
            <p className="text-[#94a3b8] text-base leading-relaxed">
              {report?.summary ?? "Interview complete. Here is your performance analysis."}
            </p>
            <div className={`mt-5 inline-flex items-center gap-2 border px-4 py-2 rounded-full font-semibold text-sm ${badge.color}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {badge.label}
            </div>
            {report?.job_position && (
              <p className="mt-3 text-xs text-[#475569]">
                Position: <span className="text-[#94a3b8] font-medium">{report.job_position}</span>
              </p>
            )}
          </div>

          {/* Score donut */}
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0 z-10">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeDasharray={`${overallScore}, 100`}
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
              />
            </svg>
            <div className="text-center">
              <span className="text-4xl font-black text-white">{overallScore}</span>
              <span className="text-sm text-[#94a3b8] block mt-[-4px]">/ 100</span>
            </div>
          </div>
        </div>

        {/* ── 2. SKILL SCORES + COMMENTS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT: Skill bars */}
          <div className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <h2 className="text-xl font-bold text-white">Skill Metrics</h2>
            </div>

            {report ? (
              <div className="space-y-6">
                <ScoreBar label="Technical Skills" score={report.technical_skills.average} />
                <ScoreBar label="Project Experience" score={report.project_experience.average} />
                <ScoreBar label="Cultural Fit" score={report.cultural_fit.average} />
                <div className="pt-2 border-t border-[#1e293b] space-y-4">
                  <p className="text-xs text-[#475569] uppercase tracking-wider font-semibold">Technical Breakdown</p>
                  <ScoreBar label="OOP" score={report.technical_skills.oop} />
                  <ScoreBar label="Algorithms" score={report.technical_skills.algorithms} />
                  <ScoreBar label="System Design" score={report.technical_skills.system_design} />
                  <ScoreBar label="Tech Stack" score={report.technical_skills.technology_stack} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {["Technical Skills", "Project Experience", "Cultural Fit", "Communication"].map((name) => (
                  <div key={name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-[#e2e8f0]">{name}</span>
                      <span className="text-sm font-bold text-[#334155]">—/100</span>
                    </div>
                    <div className="w-full bg-[#1e293b] rounded-full h-2.5 animate-pulse" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Strengths + Areas to improve */}
          <div className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 shadow-lg flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h2 className="text-xl font-bold text-white">AI Feedback</h2>
            </div>

            {/* Strengths */}
            <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-2xl p-5">
              <h3 className="text-[#22c55e] font-bold mb-3 flex items-center gap-2 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Strengths
              </h3>
              {report?.strengths?.length ? (
                <ul className="space-y-2.5">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#cbd5e1] leading-relaxed">
                      <span className="text-[#22c55e] mt-0.5 shrink-0">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#475569] italic">No data available</p>
              )}
            </div>

            {/* Areas for improvement */}
            <div className="bg-[#eab308]/5 border border-[#eab308]/20 rounded-2xl p-5">
              <h3 className="text-[#eab308] font-bold mb-3 flex items-center gap-2 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Areas to Improve
              </h3>
              {report?.areas_for_improvement?.length ? (
                <ul className="space-y-2.5">
                  {report.areas_for_improvement.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#cbd5e1] leading-relaxed">
                      <span className="text-[#eab308] mt-0.5 shrink-0">•</span>
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#475569] italic">No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. RECOMMENDATION ── */}
        {report?.recommendation && (
          <div className="bg-[#0b1120] border border-[#334155] rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h2 className="text-lg font-bold text-white">Recommendation</h2>
            </div>
            <p className="text-[#94a3b8] text-sm leading-relaxed">{report.recommendation}</p>
          </div>
        )}

        {/* ── 4. ACTION BUTTONS ── */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2 pb-10">
          <button
            onClick={() => router.push("/interview/upload-cv")}
            className="flex-1 py-4 bg-[#22c55e] text-black font-bold text-base rounded-full hover:bg-[#1ea34d] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-[0.98]"
          >
            Practice Again
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="flex-1 py-4 bg-transparent border-2 border-[#334155] text-white font-bold text-base rounded-full hover:bg-[#1e293b] hover:border-[#475569] transition-all active:scale-[0.98]"
          >
            Save to Profile
          </button>
        </div>

      </div>
    </div>
  );
}
