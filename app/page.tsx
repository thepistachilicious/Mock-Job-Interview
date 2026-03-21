"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT TEXT */}
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Practice Your{" "}
              <span className="text-green-400">Job Interview</span> with AI
            </h1>

            <p className="text-muted-foreground text-lg mb-8">
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
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
            <div className="relative h-72 w-full group">
              <Image
                src="/images/demo.jpg"
                alt="Interview Preview"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
          <div className="bg-card p-6 rounded-xl border border-border hover:border-primary transition shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-400">
              1. Upload Your CV
            </h3>
            <p className="text-muted-foreground">
              Tell us about your experience and the position you&apos;re
              applying for.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border hover:border-primary transition shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-400">
              2. AI Conducts Interview
            </h3>
            <p className="text-muted-foreground">
              Answer interview questions through video and chat just like a real
              interview.
            </p>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border hover:border-primary transition shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-400">
              3. Get Your Feedback
            </h3>
            <p className="text-muted-foreground">
              Receive a score out of 100 with detailed improvement suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* DEMO / FEATURE SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-72 w-full overflow-hidden rounded-xl border border-border">
            <Image
              src="/images/demo.jpg"
              alt="AI Interview Interface"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6 text-green-400">
              Realistic Interview Experience
            </h2>

            <p className="text-muted-foreground">
              Our AI interviewer asks questions based on your resume and the job
              description.
            </p>

            <p className="text-muted-foreground">
              You answer naturally through video while the AI evaluates your
              responses.
            </p>

            <p className="text-muted-foreground">
              After the interview, receive a detailed score and feedback to
              improve your performance.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 text-center px-6">
        <h2 className="text-4xl font-bold mb-6 text-green-400">
          Ready to Practice Your Interview?
        </h2>

        <p className="text-muted-foreground mb-10">
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
