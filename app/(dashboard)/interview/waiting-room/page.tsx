"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function WaitingRoom() {
  const router = useRouter();
  const [camera, setCamera] = useState("cam1");
  const [mic, setMic] = useState("mic1");
  const [speaker, setSpeaker] = useState("spk1");

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 md:p-8 font-sans text-white">
      <div className="max-w-5xl w-full space-y-10">
        {/* ================= PHẦN 1: INTERVIEW QUALITY & INTEGRITY NOTICE ================= */}
        <div className="space-y-6">
          {/* Tiêu đề có highlight vạch xanh bên trái */}
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#22c55e] rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">
              Lưu ý về Tính trung thực & Chất lượng
            </h2>
          </div>

          <ul className="list-disc list-inside text-[#94a3b8] text-sm space-y-2 ml-2">
            <li>
              Để có trải nghiệm tốt nhất, hãy tham gia phỏng vấn trên laptop
              bằng trình duyệt Chrome. Nếu lỗi Camera/Mic, hãy thử Tab Ẩn danh.
            </li>
            <li>
              Tất cả các buổi phỏng vấn đều được giám sát bằng AI để đảm bảo
              công bằng. Các hành động sau có thể dẫn đến hủy kết quả:
            </li>
          </ul>

          {/* 4 Thẻ Cảnh báo (Warning Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-[#0b1120] border border-[#334155] border-b-2 border-b-red-500/80 rounded-xl p-5 flex flex-col gap-4">
              <div className="w-10 h-10 bg-black border border-[#334155] rounded-lg flex items-center justify-center text-gray-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <p className="text-sm text-[#e2e8f0] font-medium leading-relaxed">
                Đọc kịch bản chuẩn bị sẵn hoặc dùng câu trả lời từ AI
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0b1120] border border-[#334155] border-b-2 border-b-red-500/80 rounded-xl p-5 flex flex-col gap-4">
              <div className="w-10 h-10 bg-black border border-[#334155] rounded-lg flex items-center justify-center text-gray-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <p className="text-sm text-[#e2e8f0] font-medium leading-relaxed">
                Sử dụng thiết bị thứ hai hoặc tiện ích mở rộng để gian lận
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0b1120] border border-[#334155] border-b-2 border-b-red-500/80 rounded-xl p-5 flex flex-col gap-4">
              <div className="w-10 h-10 bg-black border border-[#334155] rounded-lg flex items-center justify-center text-gray-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                  <path d="M6 8h.001"></path>
                  <path d="M10 8h.001"></path>
                  <path d="M14 8h.001"></path>
                  <path d="M18 8h.001"></path>
                  <path d="M8 12h8"></path>
                  <path d="M10 16h4"></path>
                </svg>
              </div>
              <p className="text-sm text-[#e2e8f0] font-medium leading-relaxed">
                Gõ câu hỏi để tạo ra câu trả lời từ các công cụ AI
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#0b1120] border border-[#334155] border-b-2 border-b-red-500/80 rounded-xl p-5 flex flex-col gap-4">
              <div className="w-10 h-10 bg-black border border-[#334155] rounded-lg flex items-center justify-center text-gray-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <p className="text-sm text-[#e2e8f0] font-medium leading-relaxed">
                Chuyển đổi qua lại giữa các Tab trình duyệt khi phỏng vấn
              </p>
            </div>
          </div>
        </div>

        <hr className="border-[#334155]" />

        {/* ================= PHẦN 2: GETTING READY (Cài đặt thiết bị) ================= */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#3b82f6] rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Chuẩn bị sẵn sàng</h2>
          </div>
          <p className="text-[#94a3b8] text-sm ml-2">
            Đảm bảo thiết bị của bạn được cấu hình đúng và tìm một không gian
            yên tĩnh, đủ sáng.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Box Preview Camera (Bên trái) */}
            <div className="bg-[#0b1120] border border-[#334155] rounded-2xl aspect-video flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
              {/* Giả lập khung hình Camera */}
              <div className="w-20 h-20 bg-[#1e293b] rounded-full flex items-center justify-center text-gray-500 mb-4 shadow-inner">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <p className="font-semibold text-[#e2e8f0]">Nguyễn Văn A</p>

              {/* Nút giả lập tính năng làm mờ nền/scroll down */}
              <div className="absolute bottom-4 bg-black/60 backdrop-blur-sm border border-[#334155] px-4 py-1.5 rounded-full text-xs text-gray-300 flex items-center gap-2 cursor-pointer hover:bg-black transition">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
                Tùy chỉnh Camera
              </div>
            </div>

            {/* Setting Devices (Bên phải) */}
            <div className="flex flex-col gap-4">
              {/* Select Camera */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect
                      x="1"
                      y="5"
                      width="15"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                  </svg>
                </div>
                <select
                  className="w-full bg-[#0b1120] border border-[#334155] text-white rounded-xl py-3.5 pl-12 pr-10 text-sm outline-none transition-all focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] appearance-none cursor-pointer"
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                >
                  <option value="cam1">HD Webcam (5986:211b)</option>
                  <option value="cam2">OBS Virtual Camera</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#94a3b8]">
                  <svg
                    width="16"
                    height="16"
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

              {/* Select Mic */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                  </svg>
                </div>
                <select
                  className="w-full bg-[#0b1120] border border-[#334155] text-white rounded-xl py-3.5 pl-12 pr-10 text-sm outline-none transition-all focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] appearance-none cursor-pointer"
                  value={mic}
                  onChange={(e) => setMic(e.target.value)}
                >
                  <option value="mic1">
                    Microphone Array (Intel® Smart Sound)
                  </option>
                  <option value="mic2">External USB Mic</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#94a3b8]">
                  <svg
                    width="16"
                    height="16"
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

              {/* Select Speaker */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </div>
                <select
                  className="w-full bg-[#0b1120] border border-[#334155] text-white rounded-xl py-3.5 pl-12 pr-10 text-sm outline-none transition-all focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] appearance-none cursor-pointer"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                >
                  <option value="spk1">
                    Default - Speakers (Realtek Audio)
                  </option>
                  <option value="spk2">Headphones (Bluetooth)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#94a3b8]">
                  <svg
                    width="16"
                    height="16"
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

              {/* Hộp thoại All Set! */}
              <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl p-4 flex items-center justify-between mt-2">
                <div className="flex items-start gap-3">
                  <div className="bg-[#22c55e] text-black rounded-full p-1 mt-0.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[#22c55e] font-bold text-sm">
                      Mọi thứ đã sẵn sàng!
                    </h3>
                    <p className="text-[#22c55e]/80 text-xs mt-0.5">
                      Giữ giọng nói rõ ràng và luôn tự tin nhé.
                    </p>
                  </div>
                </div>
                <button className="text-[#22c55e] text-sm font-semibold hover:underline">
                  Check again
                </button>
              </div>

              {/* Nút Vào Phỏng Vấn (Thêm vào để hoàn thiện flow) */}
              <button
                onClick={() => router.push("/interview")}
                className="mt-4 w-full py-4 rounded-full font-bold text-lg bg-[#22c55e] text-black hover:bg-[#1ea34d] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 active:scale-[0.98]"
              >
                Vào phòng phỏng vấn ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
