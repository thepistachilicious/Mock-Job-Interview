"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="text-white">
      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT TEXT */}
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Practice Your{" "}
              <span className="text-green-400">Job Interview</span> with AI
            </h1>

            <p className="text-gray-300 text-lg mb-8">
              Simulate real interviews with an AI interviewer, answer through
              video, and receive instant feedback based on the company&apos;s
              job description.
            </p>

            <div className="flex gap-4">
              <Link
                href="/sign-up"
                className="px-6 py-3 rounded-full bg-green-500 text-white font-semibold
                hover:bg-green-600 transition"
              >
                Start Mock Interview
              </Link>

              <Link
                href="/login"
                className="px-6 py-3 rounded-full border border-gray-500
                hover:border-green-400 hover:text-green-400 transition"
              >
                Login
              </Link>
            </div>
          </div>

          {/* RIGHT DEMO BOX */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-lg">
            <div className="h-64 flex items-center justify-center text-gray-400">
              Interview Screen Preview
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-400 transition">
            <h3 className="text-xl font-semibold mb-3 text-green-400">
              1. Upload Your CV
            </h3>
            <p className="text-gray-400">
              Tell us about your experience and the position you&apos;re
              applying for.
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-400 transition">
            <h3 className="text-xl font-semibold mb-3 text-green-400">
              2. AI Conducts Interview
            </h3>
            <p className="text-gray-400">
              Answer interview questions through video and chat just like a real
              interview.
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-400 transition">
            <h3 className="text-xl font-semibold mb-3 text-green-400">
              3. Get Your Feedback
            </h3>
            <p className="text-gray-400">
              Receive a score out of 100 with detailed improvement suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* DEMO / FEATURE SECTION */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 h-72 flex items-center justify-center text-gray-400">
            Video + AI Chat Interface
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">
              Realistic Interview Experience
            </h2>

            <p className="text-gray-400 mb-4">
              Our AI interviewer asks questions based on your resume and the job
              description.
            </p>

            <p className="text-gray-400 mb-4">
              You answer naturally through video while the AI evaluates your
              responses.
            </p>

            <p className="text-gray-400">
              After the interview, receive a detailed score and feedback to
              improve your performance.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 text-center px-6">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Practice Your Interview?
        </h2>

        <p className="text-gray-400 mb-10">
          Start your mock interview today and improve your chances of getting
          hired.
        </p>

        <Link
          href="/sign-up"
          className="px-8 py-4 rounded-full bg-green-500 font-semibold text-lg
          hover:bg-green-600 transition"
        >
          Start Free Interview
        </Link>
      </section>
    </main>
  );
}
