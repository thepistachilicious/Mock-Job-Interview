"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaAngleLeft } from "react-icons/fa6";

export default function SignUpPage() {
  const router = useRouter();

  const [user, setUser] = React.useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = React.useState(false);

  // button disabled nếu thiếu field
  const buttonDisabled = !user.username || !user.email || !user.password;

  const onSignUp = async () => {
    if (buttonDisabled || loading) return;

    try {
      setLoading(true);

      const response = await axios.post("/api/users/signup", user);

      console.log("signup okay", response.data);

      router.push("/login");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log("Failed to sign up the user", error.message);
      } else {
        console.log("Unexpected error", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="py-10 mb-10 text-5xl">
        {loading ? "Processing..." : "Sign Up"}
      </h1>

      <input
        className="w-[350px] text-slate-800 p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600"
        type="text"
        value={user.username}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
        placeholder="Username..."
      />

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
        onClick={onSignUp}
        disabled={buttonDisabled || loading}
        className="p-2 border border-gray-300 rounded-lg uppercase px-40 py-3 mt-10 font-bold
  transition-all duration-200
  enabled:hover:bg-gray-200 enabled:hover:text-black enabled:hover:scale-105
  disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Processing..."
          : buttonDisabled
            ? "Sign Up"
            : "Register My Account Now"}
      </button>

      <Link href="/login">
        <p className="mt-10 transition-all duration-200 hover:font-semibold">
          Do you have a free account already?{" "}
          <span
            className="font-bold text-green-600 ml-2 cursor-pointer underline
    transition-all duration-200 hover:text-green-400"
          >
            Login to your account
          </span>
        </p>
      </Link>

      <Link href="/">
        <p className="mt-8 opacity-50 transition-all duration-200 hover:opacity-100 hover:font-semibold">
          <FaAngleLeft className="inline mr-1" /> Back to the Homepage
        </p>
      </Link>
    </div>
  );
}
