'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, TrendingUp, Clock } from 'lucide-react';
import { adminService, UserOverview, CompanyResponse, getErrorMessage } from '@/api/adminService';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<UserOverview | null>(null);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ov, co] = await Promise.all([
          adminService.getUserOverview(),
          adminService.listCompanies(),
        ]);
        setOverview(ov);
        setCompanies(co);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 border-2 border-[#252a38] border-t-[#6c8eff] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#13161d] border border-[#252a38] rounded-xl p-6 text-[#f87171]">
        ⚠ {error}
      </div>
    );
  }

  const recentSignups = overview?.recent_signups ?? [];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Welcome back — here is what is happening.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 mb-8 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        <StatCard
          icon={<Users size={20} />}
          label="Total Users"
          value={String(overview?.total_users ?? 0)}
          accent="text-[#6c8eff]"
        />
        <StatCard
          icon={<Building2 size={20} />}
          label="Companies"
          value={String(companies.length)}
          accent="text-[#34d399]"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Recent Signups"
          value={String(recentSignups.length)}
          accent="text-[#f59e0b]"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Active Today"
          value="—"
          accent="text-[#a78bfa]"
        />
      </div>

      {/* Table */}
      <h2 className="text-base font-bold mb-3">Recent Signups</h2>

      <div className="bg-[#13161d] border border-[#252a38] rounded-xl overflow-hidden">
        {recentSignups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-[#6b7280] gap-2 text-sm">
            <Users size={36} className="opacity-30" />
            <span>No recent signups found.</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#1a1e28] border-b border-[#252a38] text-[#6b7280] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">GitHub</th>
                <th className="px-5 py-3 text-left">LinkedIn</th>
              </tr>
            </thead>
            <tbody>
              {recentSignups.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[#252a38] last:border-none hover:bg-[#1a1e28] transition"
                >
                  <td className="px-5 py-3">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'admin'
                          ? 'bg-[rgba(108,142,255,0.12)] text-[#6c8eff]'
                          : 'bg-[rgba(52,211,153,0.1)] text-[#34d399]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#6b7280]">
                    {u.linkGithub ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-[#6b7280]">
                    {u.linkLinkedin ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-[#13161d] border border-[#252a38] rounded-xl p-5">
      <div className={`flex items-center gap-2 mb-2 ${accent}`}>
        {icon}
        <span className="text-xs uppercase tracking-wider font-semibold">
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}