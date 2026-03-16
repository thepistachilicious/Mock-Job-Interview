"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaAngleLeft } from "react-icons/fa6";
import { useLogin } from "@/app/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();

  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });

  const { login, loading, error } = useLogin();

  // disable button nếu thiếu field
  const buttonDisabled = !user.email || !user.password;

  const onLogin = async () => {
    if (buttonDisabled || loading) return;

    try {
      await login(user);
      console.log("Login successful");
      router.push("/profile");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log("Login failed", error.message);
      } else {
        console.log("Unexpected error", error);
      }
    } finally {
      setUser({ email: "", password: "" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="py-10 mb-10 text-5xl">
        {loading ? "We're logging you in..." : "Account Login"}
      </h1>

      <input
        className="w-[350px] text-slate-800 p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"
        type="email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        placeholder="Email..."
      />

      <input
        className="w-[350px] text-slate-800 p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"
        type="password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
        placeholder="Password..."
      />

      <button
        onClick={onLogin}
        disabled={buttonDisabled || loading}
        className="p-2 border border-gray-300 rounded-lg uppercase px-40 py-3 mt-10 font-bold
  transition-all duration-200
  enabled:hover:bg-gray-200 enabled:hover:text-black enabled:hover:scale-105
  disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <Link href="/sign-up">
        <p className="mt-10">
          Do not have an account yet?
          <span className="font-bold text-green-600 ml-2 cursor-pointer underline hover:text-green-800 hover:font-extrabold transition">
            Register your account now
          </span>
        </p>
      </Link>

      <Link href="/">
        <p className="mt-8 opacity-50 hover:opacity-100 hover:font-semibold transition cursor-pointer">
          <FaAngleLeft className="inline mr-1" /> Back to the Homepage
        </p>
      </Link>
    </div>
  );
}
