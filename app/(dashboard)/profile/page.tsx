"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaAngleLeft,
  FaGithub,
  FaLinkedin,
  FaFilePdf,
  FaEnvelope,
  FaPen,
  FaCheck,
  FaTimes,
  FaUpload,
  FaSpinner,
} from "react-icons/fa";
import {
  userService,
  UserInformation,
  getErrorMessage,
} from "@/api/userService";
import { uploadService } from "@/api/uploadService";

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ email }: { email: string }) {
  const initials = email?.slice(0, 2).toUpperCase() ?? "??";
  return (
    <div className="w-24 h-24 rounded-full border-2 border-border flex items-center justify-center text-3xl font-bold text-foreground bg-card select-none">
      {" "}
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest border border-green-600 text-green-500 rounded-full">
      {role}
    </span>
  );
}

interface EditableFieldProps {
  label: string;
  value: string | null;
  fieldKey: keyof UserInformation;
  editing: boolean;
  onChange: (key: keyof UserInformation, value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

function EditableField({
  label,
  value,
  fieldKey,
  editing,
  onChange,
  placeholder,
  multiline = false,
}: EditableFieldProps) {
  const inputClass =
    "w-full bg-transparent border-b border-border focus:border-primary placeholder:text-muted-foreground outline-none text-foreground py-1 transition-colors duration-200 resize-none";
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {" "}
        {label}
      </span>
      {editing ? (
        multiline ? (
          <textarea
            className={inputClass + " min-h-[80px]"}
            value={value ?? ""}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <input
            className={inputClass}
            value={value ?? ""}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            placeholder={placeholder}
          />
        )
      ) : (
        <span
          className={`text-foreground text-sm ${!value ? "text-muted-foreground italic" : ""}`}
        >
          {value || placeholder || "—"}
        </span>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserInformation | null>(null);
  const [draft, setDraft] = useState<Partial<UserInformation>>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvUploadError, setCvUploadError] = useState<string | null>(null);
  const cvInputRef = React.useRef<HTMLInputElement>(null);

  // ── Fetch user on mount ──
  useEffect(() => {
    (async () => {
      try {
        const data = await userService.getUserInfo();
        setUser(data);
        setDraft(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Handlers ──
  const handleFieldChange = (key: keyof UserInformation, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await userService.updateUserInfo(draft);
      setUser(updated);
      setDraft(updated);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept only PDF
    if (file.type !== "application/pdf") {
      setCvUploadError("Only PDF files are accepted.");
      return;
    }

    setCvUploading(true);
    setCvUploadError(null);
    try {
      const { file_url } = await uploadService.uploadFile(file);
      // Persist the new URL immediately via updateUserInfo
      console.log(file_url);
      const updated = await userService.updateUserInfo({
        ...user,
        linkCV: file_url,
      });
      setUser(updated);
      setDraft(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setCvUploadError(getErrorMessage(err));
    } finally {
      setCvUploading(false);
      // Reset so the same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const handleCancel = () => {
    setDraft(user ?? {});
    setEditing(false);
    setError(null);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-28 pb-12 px-4">
        <p className="text-gray-400 animate-pulse text-lg tracking-widest uppercase">
          Loading profile...
        </p>
      </div>
    );
  }

  // ── Error / not found ──
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-28 pb-12 px-4">
        <p className="text-red-400 text-lg">
          {error ?? "Failed to load profile."}
        </p>
        <button
          onClick={() => router.push("/login")}
          className="p-2 border border-gray-300 rounded-lg px-10 py-3 font-bold uppercase hover:bg-gray-200 hover:text-black transition"
        >
          Back to Login
        </button>
      </div>
    );
  }

  // ── Profile ──
  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-28 pb-12 px-4">
      {/* Header */}
      <div className="w-full max-w-xl mb-10 flex flex-col items-center gap-4">
        <Avatar email={user.email} />
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {" "}
          {user.email}
        </h1>
        <RoleBadge role={user.role} />

        {/* Quick links */}
        <div className="flex gap-5 mt-2 text-gray-400">
          {user.linkGithub && (
            <a
              href={user.linkGithub}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition text-xl"
            >
              <FaGithub />
            </a>
          )}
          {user.linkLinkedin && (
            <a
              href={user.linkLinkedin}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition text-xl"
            >
              <FaLinkedin />
            </a>
          )}
          {user.linkCV && (
            <a
              href={user.linkCV}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition text-xl"
            >
              <FaFilePdf />
            </a>
          )}
          <a
            href={`mailto:${user.email}`}
            className="hover:text-white transition text-xl"
          >
            <FaEnvelope />
          </a>
        </div>
      </div>

      {/* Card */}
      <div
        className="
  w-full max-w-xl rounded-2xl p-8 flex flex-col gap-6 backdrop-blur-md shadow-xl
  border border-border
  bg-[hsl(var(--card))]
  dark:bg-gray-900/60
"
      >
        {" "}
        {/* Edit / Save / Cancel buttons */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold tracking-wide text-gray-300">
            PROFILE INFORMATION
          </span>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-40"
            >
              <FaPen size={12} /> Edit
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition disabled:opacity-40"
              >
                <FaTimes size={12} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-semibold transition disabled:opacity-40"
              >
                <FaCheck size={12} /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
        {/* Fields */}
        <EditableField
          label="Introduction"
          value={draft.introduction ?? null}
          fieldKey="introduction"
          editing={editing}
          onChange={handleFieldChange}
          placeholder="Write a short bio about yourself, your skills, or goals..."
          // multiline
        />
        <EditableField
          label="Date of Birth"
          value={draft.dateBirth ?? null}
          fieldKey="dateBirth"
          editing={editing}
          onChange={handleFieldChange}
          placeholder="YYYY-MM-DD"
        />
        <EditableField
          label="GitHub"
          value={draft.linkGithub ?? null}
          fieldKey="linkGithub"
          editing={editing}
          onChange={handleFieldChange}
          placeholder="https://github.com/your-username"
        />
        <EditableField
          label="LinkedIn"
          value={draft.linkLinkedin ?? null}
          fieldKey="linkLinkedin"
          editing={editing}
          onChange={handleFieldChange}
          placeholder="https://linkedin.com/in/your-profile"
        />
        {/* CV Upload */}
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
            CV / Resume
          </span>

          {/* Current file */}
          {draft.linkCV ? (
            <div className="flex items-center gap-3">
              <a
                href={draft.linkCV}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-green-400 hover:text-green-200 transition underline underline-offset-2 truncate max-w-xs"
              >
                <FaFilePdf size={14} />
                View current CV
              </a>
            </div>
          ) : (
            <span className="text-gray-600 italic text-sm">
              No CV uploaded yet
            </span>
          )}

          {/* Upload button — always visible */}
          <div className="flex items-center gap-3 mt-1">
            {/* Upload button — only visible in edit mode */}
            {editing && (
              <div className="flex items-center gap-3 mt-1">
                <input
                  aria-label="cv"
                  ref={cvInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleCvUpload}
                />
                <button
                  onClick={() => cvInputRef.current?.click()}
                  disabled={cvUploading}
                  className="
flex items-center gap-2 text-sm border border-border rounded-lg px-4 py-2
bg-background hover:bg-accent hover:border-primary hover:text-primary
transition disabled:opacity-40 disabled:cursor-not-allowed
"
                >
                  {cvUploading ? (
                    <>
                      <FaSpinner className="animate-spin" size={13} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload size={13} />
                      {draft.linkCV ? "Replace CV" : "Upload CV"}
                    </>
                  )}
                </button>
                <span className="text-xs text-gray-600">PDF only</span>
              </div>
            )}
          </div>

          {cvUploadError && (
            <p className="text-red-400 text-xs">{cvUploadError}</p>
          )}
        </div>
        {/* Feedback messages */}
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        {saveSuccess && (
          <p className="text-green-500 text-sm text-center">
            Profile updated successfully ✓
          </p>
        )}
      </div>

      {/* Back link */}
      <Link href="/">
        <p className="mt-10 opacity-50 hover:opacity-100 hover:font-semibold transition cursor-pointer">
          <FaAngleLeft className="inline mr-1" /> Back to the Homepage
        </p>
      </Link>
    </div>
  );
}
