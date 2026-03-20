"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";

export default function WaitingRoom() {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);

  const setDevices = useInterviewStore((state) => state.setDevices);
  const jdDescription = useInterviewStore((state) => state.jdDescription);
  const jobPosition = useInterviewStore((state) => state.jobPosition);
  const company = useInterviewStore((state) => state.Company);
  const cvFile = useInterviewStore((state) => state.cvFile);

  useEffect(() => {
    if (!cvFile || !jobPosition || !company || !jdDescription) {
      console.warn("Thiếu thông tin, đang quay lại bước trước...");
      router.replace("/interview/upload-cv");
    } else {
      setIsAuthorized(true);
    }
  }, [cvFile, jobPosition, company, jdDescription, router]);

  // State thiết bị
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      const audioInputs = devices.filter((d) => d.kind === "audioinput");

      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);

      if (videoInputs.length > 0 && !selectedCamera)
        setSelectedCamera(videoInputs[0].deviceId);
      if (audioInputs.length > 0 && !selectedMic)
        setSelectedMic(audioInputs[0].deviceId);
    } catch (err) {
      console.error("Lỗi lấy danh sách thiết bị:", err);
    }
  };

  const startStream = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
        },
        audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Lỗi truy cập thiết bị:", err);
    }
  };

  // 2. Chỉ chạy logic camera/mic khi đã xác nhận đủ thông tin (Authorized)
  useEffect(() => {
    if (isAuthorized) {
      getDevices().then(() => startStream());
      navigator.mediaDevices.ondevicechange = getDevices;
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isAuthorized]);

  useEffect(() => {
    if (isAuthorized && (selectedCamera || selectedMic)) {
      startStream();
    }
  }, [selectedCamera, selectedMic, isAuthorized]);

  const handleEnterInterview = () => {
    setDevices(selectedMic, selectedCamera);
    router.push("/interview");
  };

  // 3. CHẶN RENDER: Nếu chưa kiểm tra xong hoặc thiếu dữ liệu, trả về màn hình trống
  if (!isAuthorized) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 md:p-8 font-sans text-white">
      <div className="max-w-5xl w-full space-y-10">
        {/* PHẦN 1: NOTICES */}
        <div className="space-y-6">
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

        {/* PHẦN 2: GETTING READY */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#3b82f6] rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Chuẩn bị sẵn sàng</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CỘT TRÁI: PREVIEW CAMERA */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-full bg-[#0b1120] border border-[#334155] rounded-2xl aspect-video relative overflow-hidden shadow-xl bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-[#334155] px-4 py-1.5 rounded-full text-[10px] text-gray-300">
                  CAMERA PREVIEW
                </div>
              </div>
              <p className="font-semibold text-[#e2e8f0]">Nguyễn Văn A</p>
            </div>

            {/* CỘT PHẢI: SETTINGS */}
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
                  className="w-full bg-[#0b1120] border border-[#334155] text-white rounded-xl py-3.5 pl-12 pr-10 text-sm outline-none focus:border-[#22c55e] appearance-none cursor-pointer"
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                >
                  {videoDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
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
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  </svg>
                </div>
                <select
                  className="w-full bg-[#0b1120] border border-[#334155] text-white rounded-xl py-3.5 pl-12 pr-10 text-sm outline-none focus:border-[#22c55e] appearance-none cursor-pointer"
                  value={selectedMic}
                  onChange={(e) => setSelectedMic(e.target.value)}
                >
                  {audioDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `Microphone ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Box Ready Status */}
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
              </div>

              <button
                onClick={handleEnterInterview}
                className="mt-4 w-full py-4 rounded-full font-bold text-lg bg-[#22c55e] text-black hover:bg-[#1ea34d] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-[0.98]"
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
