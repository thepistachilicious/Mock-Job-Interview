"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";

export default function UploadJD() {
  const router = useRouter();
  // const [isChecking, setIsChecking] = useState(true);
  const jdDescription = useInterviewStore((state) => state.jdDescription);
  const jobPosition = useInterviewStore((state) => state.jobPosition);
  const company = useInterviewStore((state) => state.Company);
  const cvFile = useInterviewStore((state) => state.cvFile);

  const setJdDescription = useInterviewStore((state) => state.setJdDescription);
  const setJobPosition = useInterviewStore((state) => state.setJobPosition);
  const setCompany = useInterviewStore((state) => state.setCompany);

  const canSubmit = jobPosition && jdDescription && company;


  useEffect(() => {
    if (!cvFile) {
      console.warn("Không tìm thấy CV, đang quay lại bước 1...");
      router.replace("/interview/upload-cv");
    }
  }, []);

  const handleContinue = () => {
    // 1. Log dữ liệu từ State Local
    console.log("--- Dữ liệu chuẩn bị gửi đi ---");
    console.log("File CV:", cvFile);
    console.log("Vị trí:", jobPosition);
    console.log("Công ty:", company);
    console.log("Nội dung JD trong Store:", jdDescription);

    router.push("/interview/new");
  };

  if (cvFile === null) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 md:p-8 font-sans text-white">
      <div className="max-w-2xl w-full bg-[#0b1120] rounded-3xl border border-[#334155] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="mb-10 text-center border-b border-[#334155]/50 pb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Chuẩn bị <span className="text-[#22c55e]">Job Description</span>
            </h2>
            <p className="text-[#94a3b8] mt-3">
              Cung cấp thông tin vị trí để AI tùy chỉnh kịch bản phỏng vấn
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Input: Job Position */}
              <div>
                <label className="block text-sm font-semibold text-[#e2e8f0] mb-2">
                  Vị trí ứng tuyển <span className="text-[#22c55e]">*</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-black/60 border border-[#334155] text-white rounded-xl p-4 text-sm outline-none transition-all focus:border-[#22c55e] focus:bg-black focus:ring-1 focus:ring-[#22c55e] placeholder-[#475569]"
                  placeholder="VD: Frontend Engineer"
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                />
              </div>

              {/* Select: Company Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-[#e2e8f0] mb-2">
                  Công ty <span className="text-[#22c55e]">*</span>
                </label>
                <div className="relative">
                  <select
                    aria-label="select company"
                    className="w-full bg-black/60 border border-[#334155] text-white rounded-xl p-4 text-sm outline-none transition-all focus:border-[#22c55e] focus:bg-black focus:ring-1 focus:ring-[#22c55e] appearance-none cursor-pointer"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  >
                    <option value="" disabled className="text-[#475569]">
                      -- Chọn công ty --
                    </option>
                    <option value="Shopee">Shopee</option>
                    <option value="VNG Corporation">VNG Corporation</option>
                    <option value="FPT Software">FPT Software</option>
                    <option value="Grab">Grab</option>
                    <option value="Công ty khác">Công ty khác...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#94a3b8]">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Textarea: JD Text */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-[#e2e8f0] mb-2">
                Nội dung mô tả công việc (JD){" "}
                <span className="text-[#22c55e]">*</span>
              </label>
              <textarea
                className="w-full h-64 bg-black/60 border border-[#334155] text-white rounded-xl p-5 text-sm outline-none transition-all focus:border-[#22c55e] focus:bg-black focus:ring-1 focus:ring-[#22c55e] resize-none placeholder-[#475569] scrollbar-thin scrollbar-thumb-[#334155] scrollbar-track-transparent leading-relaxed"
                placeholder="Dán toàn bộ nội dung yêu cầu kỹ năng, trách nhiệm công việc... vào đây."
                value={jdDescription}
                onChange={(e) => setJdDescription(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-[#334155]/50">
              <button
                // onClick={() => router.push("/interview/waiting-room")}
                onClick={handleContinue}
                type="submit"
                disabled={!canSubmit}
                className="w-full py-4 rounded-full font-bold text-lg transition-all duration-300
                           disabled:bg-[#1e293b] disabled:text-[#64748b] disabled:cursor-not-allowed
                           bg-[#22c55e] text-black hover:bg-[#1ea34d] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-[0.98]"
              >
                Tiếp tục phỏng vấn
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
