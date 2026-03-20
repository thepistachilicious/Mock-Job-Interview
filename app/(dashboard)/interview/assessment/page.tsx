"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function AssessmentResult() {
  const router = useRouter();

  // Dữ liệu giả lập (Mock Data) kết quả phỏng vấn từ AI
  const score = 85;
  const metrics = [
    { name: 'Kỹ năng chuyên môn (Technical)', score: 90 },
    { name: 'Giao tiếp (Communication)', score: 80 },
    { name: 'Giải quyết vấn đề (Problem Solving)', score: 85 },
    { name: 'Sự tự tin (Confidence)', score: 75 },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-4 md:p-8 font-sans text-white overflow-y-auto">
      
      {/* Container chính */}
      <div className="max-w-5xl w-full space-y-8 mt-4 md:mt-10">
        
        {/* ================= 1. HEADER & ĐIỂM TỔNG QUAN ================= */}
        <div className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-[#22c55e] opacity-10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

          <div className="text-center md:text-left z-10 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              Báo cáo <span className="text-[#22c55e]">Đánh giá AI</span>
            </h1>
            <p className="text-[#94a3b8] text-lg">
              Hoàn thành tốt lắm! Dưới đây là phân tích chi tiết về buổi phỏng vấn của bạn.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/30 px-4 py-2 rounded-full text-[#22c55e] font-semibold text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Đánh giá: Rất Tiềm Năng (Good Fit)
            </div>
          </div>

          {/* Vòng tròn điểm số (Score Donut) */}
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0 z-10">
            {/* SVG Vòng tròn mờ (Background) */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
              {/* SVG Vòng tròn điểm (Foreground) - Dasharray: [score], 100 */}
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${score}, 100`} strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-[spin_1s_ease-out_reverse]" />
            </svg>
            <div className="text-center">
              <span className="text-4xl font-black text-white">{score}</span>
              <span className="text-sm text-[#94a3b8] block mt-[-4px]">/ 100</span>
            </div>
          </div>
        </div>

        {/* ================= 2. PHÂN TÍCH CHI TIẾT (GRID L/R) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CỘT TRÁI: ĐIỂM TỪNG KỸ NĂNG */}
          <div className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <h2 className="text-xl font-bold text-white">Chỉ số Kỹ năng</h2>
            </div>
            
            <div className="space-y-6">
              {metrics.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#e2e8f0]">{item.name}</span>
                    <span className="text-sm font-bold text-white">{item.score}/100</span>
                  </div>
                  <div className="w-full bg-[#1e293b] rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#16a34a] to-[#22c55e] h-2.5 rounded-full relative" 
                      style={{ width: `${item.score}%` }}
                    >
                      {/* Hiệu ứng bóng sáng chạy trên thanh progress */}
                      <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 rounded-full blur-[2px]"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: NHẬN XÉT CỦA AI */}
          <div className="bg-[#0b1120] border border-[#334155] rounded-3xl p-8 shadow-lg flex flex-col gap-6">
            <div className="flex items-center gap-3 mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <h2 className="text-xl font-bold text-white">Nhận xét chi tiết</h2>
            </div>

            {/* Điểm mạnh */}
            <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-2xl p-5">
              <h3 className="text-[#22c55e] font-bold mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Điểm mạnh nổi bật
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-sm text-[#cbd5e1] leading-relaxed">
                  <span className="text-[#22c55e] mt-1">•</span> Trả lời lưu loát, cấu trúc câu chuyện rõ ràng khi nói về dự án cũ.
                </li>
                <li className="flex items-start gap-2 text-sm text-[#cbd5e1] leading-relaxed">
                  <span className="text-[#22c55e] mt-1">•</span> Nắm vững kiến thức ReactJS & Next.js, giải thích tốt cơ chế SSR.
                </li>
              </ul>
            </div>

            {/* Điểm cần cải thiện */}
            <div className="bg-[#eab308]/5 border border-[#eab308]/20 rounded-2xl p-5">
              <h3 className="text-[#eab308] font-bold mb-3 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Cần cải thiện
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2 text-sm text-[#cbd5e1] leading-relaxed">
                  <span className="text-[#eab308] mt-1">•</span> Đôi lúc nói hơi nhanh, nên giữ nhịp độ từ tốn hơn để người nghe dễ theo dõi.
                </li>
                <li className="flex items-start gap-2 text-sm text-[#cbd5e1] leading-relaxed">
                  <span className="text-[#eab308] mt-1">•</span> Cần bổ sung thêm ví dụ thực tế khi trả lời câu hỏi về System Design.
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* ================= 3. NÚT ĐIỀU HƯỚNG ================= */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-10">
          <button 
            onClick={() => router.push('/interview/upload-cv')}
            className="flex-1 py-4 bg-[#22c55e] text-black font-bold text-lg rounded-full hover:bg-[#1ea34d] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-[0.98]"
          >
            Làm lại phỏng vấn
          </button>
          
          <button 
            onClick={() => router.push('/profile')}
            className="flex-1 py-4 bg-transparent border-2 border-[#334155] text-white font-bold text-lg rounded-full hover:bg-[#1e293b] hover:border-[#475569] transition-all active:scale-[0.98]"
          >
            Lưu vào Hồ sơ (Profile)
          </button>
        </div>

      </div>
    </div>
  );
}