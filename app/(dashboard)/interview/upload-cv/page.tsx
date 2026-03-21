"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore"; // Import store của bạn

export default function UploadCV() {
  const router = useRouter();

  // Lấy dữ liệu và hàm cập nhật từ Zustand
  const file = useInterviewStore((state) => state.cvFile);
  const setCvFile = useInterviewStore((state) => state.setCvFile);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    // Kiểm tra định dạng PDF trước khi lưu vào store
    if (selected && selected.type === "application/pdf") {
      setCvFile(selected);
    } else if (selected) {
      alert("Vui lòng chỉ chọn tệp PDF.");
    }
    e.target.value = "";
    console.log("zustand CV File:", file);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    // e.preventDefault();
    // e.stopPropagation(); // Ngăn sự kiện click lan ra label (mở file selector lần nữa)
    console.log("zustand CV File:", file);
    setCvFile(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-bold mb-4">
          Tải lên <span className="text-green-500">CV</span>
        </h1>
        <p className="text-gray-400 mb-8">
          AI sẽ dựa vào CV của bạn để tạo ra bộ câu hỏi phỏng vấn sát với thực
          tế nhất.
        </p>

        <label className="block w-full h-48 border-2 border-dashed bg-gradient-to-r from-green-200 via-green-100 to-green-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors">
          {!file ? (
            <div className="flex flex-col items-center">
              <svg
                className="text-green-500 mb-3"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-black">Nhấn để chọn file PDF</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-200 via-green-100 to-green-100 rounded-lg border border-gray-600">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-black truncate max-w-[200px] font-medium">
                {file.name}
              </span>

              <button
                onClick={handleRemoveFile}
                className="text-foreground-400 hover:text-red-500 transition-colors p-1"
                aria-label="Xóa file"
              >
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </label>

        <button
          onClick={() => router.push("/interview/upload-jd")}
          disabled={!file}
          className="
    mt-8 w-full py-4
    bg-gradient-to-r from-green-200 via-green-100 to-green-100 text-black
    font-bold text-lg rounded-full
    transition-all
    hover:opacity-90 hover:scale-[1.02]
    active:scale-100
    disabled:text-muted-foreground
    shadow-lg
  "
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
