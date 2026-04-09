/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, ExternalLink } from 'lucide-react';
import {
  adminService,
  UserInformationResponse,
  getErrorMessage,
} from '@/api/adminService';

export default function AdminUsersPage() {
  const [overview, setOverview] = useState<{
    total_users: number;
    users: UserInformationResponse[];
  } | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await adminService.getUserOverview();
        console.log(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setOverview(data as any);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const users = overview?.users ?? [];

  const filtered = users.filter(
    (u: any) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {overview ? `${overview.total_users} total users` : 'Loading…'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
        />
        <input
          className="w-full bg-[#1a1e28] border border-[#252a38] rounded-md py-2 pl-9 pr-3 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:border-[#6c8eff]"
          placeholder="Search by email or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-5 h-5 border-2 border-[#252a38] border-t-[#6c8eff] rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-[#13161d] border border-[#252a38] rounded-xl p-6 text-[#f87171]">
          ⚠ {error}
        </div>
      ) : (
        <div className="bg-[#13161d] border border-[#252a38] rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-[#6b7280] gap-2 text-sm">
              <Users size={36} className="opacity-30" />
              <span>No users found.</span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#1a1e28] border-b border-[#252a38] text-[#6b7280] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">DOB</th>
                  <th className="px-5 py-3 text-left">CV</th>
                  <th className="px-5 py-3 text-left">GitHub</th>
                  <th className="px-5 py-3 text-left">LinkedIn</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u: any) => (
                  <tr
                    key={u.id}
                    className="border-b border-[#252a38] last:border-none hover:bg-[#1a1e28] transition"
                  >
                    <td className="px-5 py-3 font-medium">{u.email}</td>

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
                      {u.dateBirth ?? '—'}
                    </td>

                    <td className="px-5 py-3">
                      {u.linkCV ? (
                        <a
                          href={u.linkCV}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#6c8eff] text-sm hover:underline"
                        >
                          CV
                        </a>
                      ) : (
                        <span className="text-[#6b7280]">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-xs text-[#6b7280]">
                      {u.linkGithub ? (
                        <a
                          href={u.linkGithub}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#6c8eff] hover:underline"
                        >
                          {u.linkGithub.replace('https://github.com/', '@')}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-5 py-3 text-xs text-[#6b7280]">
                      {u.linkLinkedin ? (
                        <a
                          href={u.linkLinkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#6c8eff] hover:underline"
                        >
                          LinkedIn
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-[#252a38] bg-[#1a1e28] hover:border-[#6c8eff] hover:text-[#6c8eff] transition"
                      >
                        <ExternalLink size={13} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}