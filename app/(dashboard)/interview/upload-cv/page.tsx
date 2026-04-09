/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewStore } from "@/store/useInterviewStore";

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const PDFJS_VERSION = "3.11.174";
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

function loadPdfjsFromCDN(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve();
    const script = document.createElement("script");
    script.src = `${PDFJS_CDN}/pdf.min.js`;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load pdf.js from CDN"));
    document.head.appendChild(script);
  });
}

async function extractTextFromPdf(file: File): Promise<string> {
  await loadPdfjsFromCDN();
  const arrayBuffer = await file.arrayBuffer();
  const typedArray = new Uint8Array(arrayBuffer);
  const pdfDocument = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
  let fullText = "";
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

export default function UploadCV() {
  const router = useRouter();

  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [parsedText, setParsedText] = useState("");

  const setCvFile = useInterviewStore((state) => state.setCvFile);
  const setCvText = useInterviewStore((state) => state.setCvText);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    setError("");
    setParsedText("");

    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setError("Vui lòng chỉ chọn tệp PDF.");
      return;
    }

    setLocalFile(selected);
    setCvFile(selected);
    setExtracting(true);

    try {
      const text = await extractTextFromPdf(selected);
      if (text.trim().length < 50) {
        setError("Không thể đọc nội dung PDF. Hãy thử file khác.");
        setLocalFile(null);
        setCvFile(null);
        setCvText("");
        setParsedText("");
      } else {
        setCvText(text);
        setParsedText(text);
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi khi đọc file PDF. Vui lòng thử lại.");
      setLocalFile(null);
      setCvFile(null);
      setCvText("");
      setParsedText("");
    } finally {
      setExtracting(false);
    }

  };

  const handleRemoveFile = () => {
    setLocalFile(null);
    setCvFile(null);
    setCvText("");
    setParsedText("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          Tải lên <span className="text-green-500">CV</span>
        </h1>
        <p className="text-gray-400 mb-8">
          AI sẽ dựa vào CV của bạn để tạo ra bộ câu hỏi phỏng vấn sát với thực
          tế nhất.
        </p>

        {/* Upload area */}
        <label className="block w-full h-48 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors bg-gray-900/50">
          {extracting ? (
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin text-green-500" width="36" height="36" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="text-gray-400 text-sm">Đang đọc nội dung PDF…</p>
            </div>
          ) : !localFile ? (
            <div className="flex flex-col items-center">
              <svg className="text-green-500 mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-black">Nhấn để chọn file PDF</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-white truncate max-w-[200px] font-medium">{localFile.name}</span>
              <button
                onClick={(e) => { e.preventDefault(); handleRemoveFile(); }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                aria-label="Xóa file"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            disabled={extracting}
          />
        </label>

        {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

        {/* Parsed text preview */}
        {parsedText && (
          <div className="mt-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Nội dung đã trích xuất
              </h2>
              <span className="text-xs text-gray-600">
                {parsedText.trim().length} ký tự
              </span>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap break-words font-mono leading-relaxed">
                {parsedText.trim()}
              </pre>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push("/interview/upload-jd")}
          disabled={!localFile || extracting}
          className="mt-8 w-full py-4 bg-green-500 text-black font-bold text-lg rounded-full
                     disabled:bg-gray-800 disabled:text-gray-500 transition-all
                     hover:scale-[1.02] active:scale-100 shadow-lg shadow-green-500/10"

        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
