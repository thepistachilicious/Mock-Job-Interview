"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const POSITIONS = [
  "Software Engineer",
  "AI Engineer",
  "Machine Learning Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "Cloud Engineer",
  "Mobile Engineer (iOS/Android)",
  "Security Engineer",
  "Product Manager",
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [form, setForm] = useState({
    linkedin_url: "",
    github_url: "",
    position: "",
    additional_info: "",
    candidate_name: "",
    candidate_email: "",
    candidate_phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: form, 1: generating, 2: done
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [generatedName, setGeneratedName] = useState("");

  const steps = [
    "Fetching GitHub repositories...",
    "Analyzing your experience...",
    "Tailoring content for position...",
    "Crafting compelling narrative...",
    "Building PDF layout...",
    "Finalizing your CV...",
  ];
  const [stepIndex, setStepIndex] = useState(0);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setStep(1);
    setStepIndex(0);

    // Animate steps
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }, 1800);

    try {
      const response = await fetch(`${API_BASE}/generate-cv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      clearInterval(interval);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to generate CV");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const name = response.headers.get("X-CV-Name") || form.candidate_name || "Candidate";
      setDownloadUrl(url);
      setGeneratedName(name);
      setStep(2);
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setError("");
    setDownloadUrl("");
    setGeneratedName("");
    setStepIndex(0);
  };

  return (
    <main className="min-h-screen bg-[#060B18] text-white overflow-hidden relative">
      {/* Background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Glow orbs */}
      <div className="fixed top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-mono tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI-POWERED CV GENERATOR
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4 leading-none">
            <span className="text-white">Build Your</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Perfect CV
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            Connect your LinkedIn & GitHub. Our AI crafts a tailored, job-specific CV — exported as a professional PDF.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── FORM ── */}
          {step === 0 && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {error && (
                <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm flex items-start gap-3">
                  <span className="text-lg">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Card 1: Profile Links */}
                <FormCard title="Profile Links" icon="🔗">
                  <Field
                    label="LinkedIn URL"
                    name="linkedin_url"
                    value={form.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourname"
                    required
                    prefix="in"
                  />
                  <Field
                    label="GitHub URL"
                    name="github_url"
                    value={form.github_url}
                    onChange={handleChange}
                    placeholder="https://github.com/yourusername"
                    prefix="⌥"
                  />
                </FormCard>

                {/* Card 2: Target Position */}
                <FormCard title="Target Position" icon="🎯">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Position <span className="text-blue-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="position"
                        value={form.position}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#0D1425] border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select a position...</option>
                        {POSITIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                        <option value="custom">✏ Custom position...</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">▾</div>
                    </div>
                    {form.position === "custom" && (
                      <input
                        type="text"
                        name="position"
                        onChange={handleChange}
                        placeholder="e.g. Blockchain Engineer"
                        className="mt-2 w-full bg-[#0D1425] border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/60 transition-all placeholder:text-slate-600"
                      />
                    )}
                  </div>
                </FormCard>

                {/* Card 3: Personal Info */}
                <FormCard title="Personal Details" icon="👤" optional>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name" name="candidate_name" value={form.candidate_name} onChange={handleChange} placeholder="Jane Doe" />
                    <Field label="Email" name="candidate_email" value={form.candidate_email} onChange={handleChange} placeholder="jane@email.com" type="email" />
                  </div>
                  <Field label="Phone" name="candidate_phone" value={form.candidate_phone} onChange={handleChange} placeholder="+84 90 000 0000" />
                </FormCard>

                {/* Card 4: Additional Context */}
                <FormCard title="Additional Context" icon="📝" optional>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Extra Information
                    </label>
                    <textarea
                      name="additional_info"
                      value={form.additional_info}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Mention specific skills, achievements, or anything you want highlighted..."
                      className="w-full bg-[#0D1425] border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600 resize-none"
                    />
                  </div>
                </FormCard>

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/30 group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <span className="text-xl">✦</span>
                    Generate My CV
                    <span className="text-xl">✦</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </motion.button>

                <p className="text-center text-xs text-slate-600">
                  Your data is processed securely and not stored permanently.
                </p>
              </form>
            </motion.div>
          )}

          {/* ── GENERATING ── */}
          {step === 1 && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative mb-10">
                <div className="w-24 h-24 rounded-full border-2 border-blue-500/20 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 rounded-full border-2 border-t-blue-400 border-transparent animate-spin" style={{ animationDuration: '1s' }} />
                <div className="absolute inset-0 flex items-center justify-center text-3xl">⚡</div>
              </div>
              
              <h2 className="text-2xl font-bold mb-3 text-white">Generating Your CV</h2>
              
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-blue-400 text-sm font-mono mb-8"
                >
                  {steps[stepIndex]}
                </motion.p>
              </AnimatePresence>

              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      i <= stepIndex ? 'bg-blue-400' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {step === 2 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-blue-900/40"
              >
                ✓
              </motion.div>
              
              <h2 className="text-3xl font-black mb-2 text-white">CV Ready!</h2>
              <p className="text-slate-400 mb-8">
                {generatedName ? `${generatedName}'s CV has been generated.` : 'Your CV has been generated.'} Download it below.
              </p>

              <div className="bg-[#0D1425] border border-slate-700/60 rounded-2xl p-6 mb-6 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-lg shadow-md">
                    📄
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      CV_{(generatedName || "Candidate").replace(/\s/g, "_")}_{form.position.replace(/\s/g, "_")}.pdf
                    </div>
                    <div className="text-xs text-slate-500">PDF Document • Ready to download</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs text-slate-400">
                  {[
                    { label: "Format", value: "PDF" },
                    { label: "Position", value: form.position },
                    { label: "AI Model", value: "Gemini 2.0" },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                      <div className="text-slate-500 mb-1">{label}</div>
                      <div className="text-white font-medium truncate">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={downloadUrl}
                  download={`CV_${(generatedName || "Candidate").replace(/\s/g, "_")}.pdf`}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
                >
                  ↓ Download PDF
                </a>
                <button
                  onClick={handleReset}
                  className="px-6 py-4 rounded-2xl border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600 transition-all font-medium"
                >
                  New CV
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ── Sub-components ──

function FormCard({ title, icon, children, optional }) {
  return (
    <div className="bg-[#0A1020]/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{title}</span>
        {optional && <span className="text-xs text-slate-600 font-normal normal-case tracking-normal">— optional</span>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, required, type = "text", prefix }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {label} {required && <span className="text-blue-400">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 select-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-[#0D1425] border border-slate-700/60 rounded-xl py-3 text-white text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600 ${prefix ? 'pl-9 pr-4' : 'px-4'}`}
        />
      </div>
    </div>
  );
}