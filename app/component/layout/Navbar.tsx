"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;

      if (current > lastScroll && current > 80) {
        setShow(false); // scroll xuống → ẩn
      } else {
        setShow(true); // scroll lên → hiện
      }

      setLastScroll(current);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  return (
    // Đã đổi từ "fixed" sang "sticky" để đẩy các component bên dưới xuống
    <div
      className={`sticky top-0 left-0 w-full flex justify-center z-50 transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Navbar container */}
      <div
        className="w-11/12 md:w-3/4 lg:w-2/3 flex items-center justify-between px-6 py-3 rounded-b-xl shadow-md
      bg-gradient-to-r from-green-200 via-gray-100 to-green-100 backdrop-blur-md"
      >
        {/* Website name */}
        <Link
          href="/"
          className="text-xl font-bold text-gray-800 hover:opacity-70 transition"
        >
          Mock Interview
        </Link>

        {/* CÁC MỤC ĐIỀU HƯỚNG MỚI (Nằm giữa) */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/interview/upload-cv" // Sửa ở đây
            className="font-bold text-gray-700 hover:text-green-600 transition-colors"
          >
            Interview
          </Link>
          <Link
            href="/profile"
            className="font-bold text-gray-700 hover:text-green-600 transition-colors"
          >
            Profile
          </Link>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 md:gap-4">
          <Link
            href="/login"
            className="px-4 py-2 bg-green-100 border border-green-400 rounded-full font-semibold text-gray-800
    transition-all duration-200
    hover:bg-green-300 hover:text-gray-900 hover:scale-105"
          >
            Login
          </Link>

          <Link
            href="/sign-up"
            className="px-4 py-2 bg-green-100 border border-green-400 rounded-full font-semibold text-gray-800
    transition-all duration-200
    hover:bg-green-300 hover:text-gray-900 hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
