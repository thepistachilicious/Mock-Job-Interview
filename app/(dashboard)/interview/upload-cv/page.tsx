"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadCV() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") setFile(selected);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        {/* Text mô tả */}
        <h1 className="text-4xl font-bold mb-4">
          Tải lên <span className="text-green-500">CV</span>
        </h1>
        <p className="text-gray-400 mb-8">
          AI sẽ dựa vào CV của bạn để tạo ra bộ câu hỏi phỏng vấn sát với thực
          tế nhất.
        </p>

        {/* Khu vực Upload */}
        <label className="block w-full h-48 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors bg-gray-900/50">
          {!file ? (
            <div className="flex flex-col items-center">
              {/* Icon Upload (SVG thuần) */}
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
              <p className="text-gray-300">Nhấn để chọn file PDF</p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Icon File (SVG thuần) */}
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
              <span className="text-white truncate max-w-[200px]">
                {file.name}
              </span>

              {/* Nút X (SVG thuần) */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setFile(null);
                }}
                className="text-gray-500 hover:text-red-500 ml-2"
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

        {/* Nút Submit */}
        <button
          onClick={() => router.push("/interview/upload-jd")}
          disabled={!file}
          className="mt-8 w-full py-4 bg-green-500 text-black font-bold text-lg rounded-full disabled:bg-gray-800 disabled:text-gray-500 transition-colors"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
