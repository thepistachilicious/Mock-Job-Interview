"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { FaChevronDown, FaUser, FaSignOutAlt, FaIdBadge } from "react-icons/fa";

export default function Navbar() {
  const { user, loading, isAdmin, logout } = useAuth();

  // ── hide-on-scroll ──────────────────────────────────────────────────────────
  const [show, setShow] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setShow(current <= lastScroll || current <= 80);
      setLastScroll(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  // ── avatar dropdown ─────────────────────────────────────────────────────────
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── avatar initials ─────────────────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const roleBadgeColor =
    isAdmin
      ? "bg-amber-100 text-amber-700 border-amber-300"
      : "bg-green-100 text-green-700 border-green-300";

  return (
    <div
      className={`sticky bg-gray-950 top-0 left-0 w-full flex justify-center z-50 transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div
        className="w-11/12 md:w-3/4 lg:w-2/3 flex items-center justify-between px-6 py-3 rounded-b-xl shadow-md
          bg-gradient-to-r from-green-200 via-gray-100 to-green-100 backdrop-blur-md"
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-gray-800 hover:opacity-70 transition"
        >
          Mock Interview
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/interview/upload-cv"
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

        {/* Auth area */}
        <div className="flex gap-3 md:gap-4 items-center">
          {loading ? (
            /* skeleton pill while auth resolves */
            <div className="h-9 w-24 rounded-full bg-green-200 animate-pulse" />
          ) : user ? (
            /* ── logged-in: avatar + dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-400
                  bg-green-100 hover:bg-green-200 transition-all duration-200 hover:scale-105"
              >
                {/* Avatar circle */}
                <span className="w-7 h-7 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center select-none">
                  {initials}
                </span>

                {/* Name (hidden on small screens) */}
                <span className="hidden sm:block text-sm font-semibold text-gray-800 max-w-[100px] truncate">
                  {user.name}
                </span>

                <FaChevronDown
                  className={`text-gray-500 text-xs transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                  {/* User info header */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {/* Role badge */}
                    <span
                      className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${roleBadgeColor}`}
                    >
                      <FaIdBadge className="text-[10px]" />
                      {isAdmin ? "Admin" : "User"}
                    </span>
                  </div>

                  {/* Profile link */}
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FaUser className="text-gray-400 text-xs" />
                    My Profile
                  </Link>

                  {/* Admin panel link (admins only) */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      <FaIdBadge className="text-amber-400 text-xs" />
                      Admin Panel
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={async () => {
                      setDropdownOpen(false);
                      await logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt className="text-red-400 text-xs" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── logged-out: login + sign-up buttons ── */
            <>
              <Link
                href="/login"
                className="px-4 py-2 bg-green-100 border border-green-400 rounded-full font-semibold text-gray-800
                  transition-all duration-200 hover:bg-green-300 hover:text-gray-900 hover:scale-105"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 bg-green-100 border border-green-400 rounded-full font-semibold text-gray-800
                  transition-all duration-200 hover:bg-green-300 hover:text-gray-900 hover:scale-105"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}