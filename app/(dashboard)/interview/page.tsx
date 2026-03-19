"use client";
import React, { useState, useEffect } from 'react';

export default function OngoingInterview() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentQuestionText, setCurrentQuestionText] = useState("Vui lòng giới thiệu ngắn gọn về bản thân và kinh nghiệm làm việc của bạn.");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen w-full bg-[#0b1120] text-white flex flex-col font-sans overflow-hidden relative">
      
      {/* ================= HEADER (Đã làm mỏng lại) ================= */}
      <header className="w-full flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-md border-b border-[#334155]/50 relative z-40">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-[#22c55e] rounded-full"></div>
          <h1 className="text-lg font-bold tracking-tight">
            Practice Your <span className="text-[#22c55e]">Interview</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-black/60 border border-[#334155] px-4 py-1.5 rounded-full">
          <div className="flex items-center gap-2 text-[#94a3b8] text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="font-medium text-white w-10 text-center">{formatTime(timer)}</span>
          </div>
          <div className="h-4 w-px bg-[#334155]"></div>
          <div className="text-sm font-medium text-white">
            Câu <span className="text-[#22c55e] font-bold mx-0.5">{currentQuestionNumber}</span> / {totalQuestions}
          </div>
        </div>
      </header>

      {/* ================= MAIN INTERACTION AREA ================= */}
      <main className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#22c55e] opacity-[0.02] rounded-full blur-3xl pointer-events-none"></div>

        {/* 1. HIỂN THỊ CÂU HỎI (Thu gọn chiều rộng, chữ vừa phải) */}
        {/* <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30">
          <div className="bg-black/60 backdrop-blur-md border border-[#334155] p-4 rounded-xl shadow-lg text-center">
            <h3 className="text-[11px] text-[#94a3b8] font-semibold uppercase tracking-widest mb-1.5">Câu hỏi hiện tại từ AI</h3>
            <p className="text-base md:text-lg font-medium text-white leading-relaxed whitespace-pre-wrap">
              {currentQuestionText}
            </p>
          </div>
        </div> */}

        {/* 2. CHÍNH GIỮA: AVATAR AI (Thu nhỏ kích thước) */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative">
            {/* Hiệu ứng sóng mờ nhẹ nhàng hơn */}
            <div className="absolute inset-0 w-full h-full bg-[#22c55e] opacity-10 rounded-full blur-lg scale-[1.25] animate-pulse"></div>
            <div className="absolute inset-0 w-full h-full border border-[#22c55e]/20 rounded-full scale-[1.12]"></div>

            {/* Khối Avatar chính thu nhỏ xuống 160px - 192px */}
            <div className="w-40 h-40 md:w-48 md:h-48 bg-black border-[3px] border-[#334155] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.1)] relative z-10">
              {/* <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1" className="opacity-80">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11v6m0-6a3 3 0 1 1-6 0h6a3 3 0 1 0 6 0" strokeWidth="0.5" strokeDasharray="1 1"/>
              </svg> */}
            </div>
            
            {/* Trạng thái AI */}
            <div className="absolute bottom-[-28px] left-1/2 -translate-x-1/2 bg-[#22c55e]/15 border border-[#22c55e]/40 px-3 py-1 rounded-full text-[10px] text-[#22c55e] font-bold tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
              </span>
              AI ĐANG NGHE
            </div>
          </div>
        </div>

        {/* 3. GÓC DƯỚI PHẢI: SELF-VIEW (Thu nhỏ và canh lề ngang hàng với thanh điều khiển) */}
        <div className={`absolute bottom-6 right-6 w-48 md:w-56 aspect-video bg-black border border-[#334155] rounded-xl shadow-xl z-20 overflow-hidden transition-all duration-300 ${camOn ? '' : 'flex items-center justify-center'}`}>
          {camOn ? (
            <div className="w-full h-full relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] to-[#1e293b]/50 flex items-center justify-center text-gray-500 font-bold text-xl">YOU</div>
              <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white font-medium backdrop-blur-sm">Bạn</div>
            </div>
          ) : (
            <div className="text-gray-600 flex flex-col items-center gap-1.5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <span className="text-[10px] font-medium">Camera Off</span>
            </div>
          )}
        </div>

        {/* ================= 4. ĐIỀU KHIỂN (Thu nhỏ Icon và Padding) ================= */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md border border-[#334155] px-6 py-2.5 rounded-full z-30 shadow-lg">
          
          <button onClick={() => setMicOn(!micOn)} className={`p-3 rounded-full transition-all duration-300 ${micOn ? 'bg-[#1e293b] text-white hover:bg-gray-700' : 'bg-red-500 text-black hover:bg-red-600'}`} title={micOn ? 'Tắt Mic' : 'Bật Mic'}>
            {micOn ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="1" y1="1" x2="23" y2="23"/></svg>
            )}
          </button>

          <button onClick={() => setCamOn(!camOn)} className={`p-3 rounded-full transition-all duration-300 ${camOn ? 'bg-[#1e293b] text-white hover:bg-gray-700' : 'bg-red-500 text-black hover:bg-red-600'}`} title={camOn ? 'Tắt Camera' : 'Bật Camera'}>
            {camOn ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            )}
          </button>

          <div className="h-8 w-px bg-[#334155] mx-1"></div>

          <button className="px-5 py-2.5 rounded-full bg-red-600 text-white font-bold text-sm tracking-wide hover:bg-red-700 transition-all active:scale-[0.97]">
            Kết thúc
          </button>
        </div>

      </main>
    </div>
  );
}