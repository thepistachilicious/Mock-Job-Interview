'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Cake,
  Github,
  Linkedin,
  FileText,
  BookOpen,
} from 'lucide-react';
import {
  adminService,
  UserInformationResponse,
  getErrorMessage,
} from '@/api/adminService';

export default function AdminUserDetailPage() {
  const { user_id } = useParams<{ user_id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<UserInformationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user_id) return;
    adminService
      .getUserDetails(user_id)
      .then(setUser)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [user_id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-5 h-5 border-2 border-[#252a38] border-t-[#6c8eff] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-[#13161d] border border-[#252a38] rounded-xl p-6 text-[#f87171]">
        ⚠ {error ?? 'User not found.'}
      </div>
    );
  }

  return (
    <>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 px-3 py-1.5 mb-4 rounded-md text-xs font-medium border border-[#252a38] bg-[#1a1e28] hover:border-[#6c8eff] hover:text-[#6c8eff] transition"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Detail</h1>
          <p className="text-sm text-[#6b7280] mt-1">{user.email}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            user.role === 'admin'
              ? 'bg-[rgba(108,142,255,0.12)] text-[#6c8eff]'
              : 'bg-[rgba(52,211,153,0.1)] text-[#34d399]'
          }`}
        >
          {user.role}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard icon={<User size={16} />} label="User ID" value={user.id} mono />
        <InfoCard icon={<Mail size={16} />} label="Email" value={user.email} />
        <InfoCard icon={<Cake size={16} />} label="Date of Birth" value={user.dateBirth ?? '—'} />
        <InfoCard icon={<BookOpen size={16} />} label="Introduction" value={user.introduction ?? '—'} />
        <InfoCard icon={<FileText size={16} />} label="CV Link" value={user.linkCV ?? '—'} link={user.linkCV ?? undefined} />
        <InfoCard icon={<Github size={16} />} label="GitHub" value={user.linkGithub ?? '—'} link={user.linkGithub ?? undefined} />
        <InfoCard icon={<Linkedin size={16} />} label="LinkedIn" value={user.linkLinkedin ?? '—'} link={user.linkLinkedin ?? undefined} />
      </div>
    </>
  );
}

function InfoCard({
  icon,
  label,
  value,
  link,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  link?: string;
  mono?: boolean;
}) {
  const baseText =
    'text-sm break-all ' + (mono ? 'font-mono' : 'font-normal');

  return (
    <div className="bg-[#13161d] border border-[#252a38] rounded-xl p-5">
      <div className="flex items-center gap-2 text-[#6b7280] mb-2">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className={`${baseText} text-[#6c8eff] hover:underline`}
        >
          {value}
        </a>
      ) : (
        <p
          className={`${baseText} ${
            value === '—' ? 'text-[#6b7280]' : 'text-white'
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}