'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Trash2, ExternalLink, X, Search } from 'lucide-react';
import {
  adminService,
  CompanyResponse,
  CompanyCreateRequest,
  getErrorMessage,
} from '@/api/adminService';

const EMPTY_FORM: CompanyCreateRequest = {
  name: '',
  introduction: '',
  requirement: '',
  culture: '',
  tech_stack: '',
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CompanyCreateRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchCompanies(); }, []);

  async function fetchCompanies() {
    setLoading(true);
    setError(null);
    try {
      setCompanies(await adminService.listCompanies());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const created = await adminService.createCompany(form);
      setCompanies((prev) => [created, ...prev]);
      setShowCreate(false);
      setForm(EMPTY_FORM);
    } catch (e) {
      setSaveError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminService.deleteCompany(deleteId);
      setCompanies((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      alert(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }

  const filtered = companies.filter((c) =>
    (c.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.tech_stack ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.introduction ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const formFields: [keyof CompanyCreateRequest, string][] = [
    ['name', 'Company Name *'],
    ['introduction', 'Introduction'],
    ['requirement', 'Requirements'],
    ['culture', 'Culture'],
    ['tech_stack', 'Tech Stack'],
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {companies.length} companies registered
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-[#6c8eff] text-white hover:bg-[#5577ff] transition"
        >
          <Plus size={15} />
          New Company
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" size={15} />
        <input
          className="w-full bg-[#1a1e28] border border-[#252a38] rounded-md py-2 pl-9 pr-3 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:border-[#6c8eff]"
          placeholder="Search name, introduction, tech stack…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
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
              <Building2 size={36} className="opacity-30" />
              <span>No companies found.</span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#1a1e28] border-b border-[#252a38] text-[#6b7280] text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Introduction</th>
                  <th className="px-5 py-3 text-left">Tech Stack</th>
                  <th className="px-5 py-3 text-left">Culture</th>
                  <th className="px-5 py-3 text-left">Created</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[#252a38] last:border-none hover:bg-[#1a1e28] transition"
                  >
                    <td className="px-5 py-3 font-semibold">{c.name ?? '—'}</td>
                    <td className="px-5 py-3 text-[#6b7280] max-w-[200px] truncate">
                      {c.introduction ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-[#6b7280]">{c.tech_stack ?? '—'}</td>
                    <td className="px-5 py-3 text-[#6b7280]">{c.culture ?? '—'}</td>
                    <td className="px-5 py-3 text-xs text-[#6b7280]">
                      {c.datecreated
                        ? new Date(c.datecreated).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/companies/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-[#252a38] bg-[#1a1e28] hover:border-[#6c8eff] hover:text-[#6c8eff] transition"
                        >
                          <ExternalLink size={13} />
                          View
                        </Link>
                        <button
                          aria-label="Delete Company"
                          onClick={() => setDeleteId(c.id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-[rgba(248,113,113,0.12)] text-[#f87171] hover:bg-[rgba(248,113,113,0.22)] transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-[#13161d] border border-[#252a38] rounded-2xl p-8 w-[460px] max-w-[95vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">New Company</h2>
              <button
                aria-label="Close"
                onClick={() => setShowCreate(false)}
                className="text-[#6b7280] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {formFields.map(([field, label]) => (
                <div key={field} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                    {label}
                  </label>
                  {field === 'introduction' || field === 'requirement' || field === 'culture' ? (
                    <textarea
                      rows={3}
                      className="bg-[#1a1e28] border border-[#252a38] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:border-[#6c8eff] resize-none"
                      placeholder={label}
                      value={(form[field] as string) ?? ''}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    />
                  ) : (
                    <input
                      className="bg-[#1a1e28] border border-[#252a38] rounded-md px-3 py-2 text-sm text-white placeholder:text-[#6b7280] focus:outline-none focus:border-[#6c8eff]"
                      placeholder={label}
                      value={(form[field] as string) ?? ''}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      required={field === 'name'}
                    />
                  )}
                </div>
              ))}

              {saveError && (
                <p className="text-[#f87171] text-sm">⚠ {saveError}</p>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm rounded-md border border-[#252a38] bg-[#1a1e28] hover:border-[#6c8eff] hover:text-[#6c8eff] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm rounded-md bg-[#6c8eff] text-white hover:bg-[#5577ff] transition disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="bg-[#13161d] border border-[#252a38] rounded-2xl p-6 w-[380px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Delete Company?</h2>
            <p className="text-sm text-[#6b7280]">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm rounded-md border border-[#252a38] bg-[#1a1e28] hover:border-[#6c8eff] hover:text-[#6c8eff] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-md bg-[rgba(248,113,113,0.12)] text-[#f87171] hover:bg-[rgba(248,113,113,0.22)] transition disabled:opacity-60"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-[#f87171]/40 border-t-[#f87171] rounded-full animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}