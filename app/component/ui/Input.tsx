import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

export default function SimpleUploadCV() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 text-center">
        
        <h2 className="text-3xl font-bold mb-2">
          Upload <span className="text-[#22c55e]">CV</span>
        </h2>
        <p className="text-gray-400 mb-8 text-sm">Chấp nhận định dạng PDF</p>

        {/* Khung Upload */}
        <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-[#22c55e] transition-colors mb-6">
          {!file ? (
            <div className="flex flex-col items-center justify-center">
              <Upload className="text-[#22c55e] mb-2" size={32} />
              <p className="text-sm">Nhấn để chọn file</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#22c55e]">
              <FileText size={24} />
              <span className="text-sm font-medium truncate max-w-[150px]">{file.name}</span>
              <button onClick={(e) => { e.preventDefault(); setFile(null); }}>
                <X size={18} className="text-gray-400 hover:text-white" />
              </button>
            </div>
          )}
          <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
        </label>

        {/* Nút bấm */}
        <div className="flex flex-col gap-3">
          <button 
            disabled={!file}
            className="w-full py-3 bg-[#22c55e] text-black font-bold rounded-full disabled:bg-gray-700 disabled:text-gray-500 hover:opacity-90 transition-all"
          >
            Bắt đầu phỏng vấn
          </button>
          <button className="text-gray-400 text-sm hover:underline">
            Bỏ qua bước này
          </button>
        </div>

      </div>
    </div>
  );
}