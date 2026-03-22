'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Pencil,
  X,
  Globe,
  MapPin,
  Briefcase,
  Image,
  AlignLeft,
} from 'lucide-react';
import {
  adminService,
  CompanyResponse,
  CompanyUpdateRequest,
  getErrorMessage,
} from '@/api/adminService';

export default function AdminCompanyDetailPage() {
  const { company_id } = useParams<{ company_id: string }>();
  const router = useRouter();

  const [company, setCompany] = useState<CompanyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CompanyUpdateRequest>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!company_id) return;
    adminService
      .getCompanyDetails(company_id)
      .then((c) => {
        setCompany(c);
        setForm({
          name: c.name,
          description: c.description ?? '',
          website: c.website ?? '',
          industry: c.industry ?? '',
          location: c.location ?? '',
          logo_url: c.logo_url ?? '',
        });
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [company_id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!company_id) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await adminService.updateCompany(company_id, form);
      setCompany(updated);
      setEditing(false);
    } catch (e) {
      setSaveError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-5 h-5 border-2 border-[#252a38] border-t-[#6c8eff] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="bg-[#13161d] border border-[#252a38] rounded-xl p-6 text-[#f87171]">
        ⚠ {error ?? 'Company not found.'}
      </div>
    );
  }

  return (
    <>
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 px-3 py-1.5 mb-4 rounded-md text-xs font-medium border border-[#252a38] bg-[#1a1e28] hover:border-[#6c8eff] hover:text-[#6c8eff] transition"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="w-12 h-12 rounded-lg object-cover border border-[#252a38]"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[#1a1e28] border border-[#252a38] flex items-center justify-center text-[#6b7280]">
              <Briefcase size={20} />
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-sm text-[#6b7280] mt-1">ID: {company.id}</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditing(!editing);
            setSaveError(null);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
            editing
              ? 'border border-[#252a38] bg-[#1a1e28] hover:border-[#6c8eff] hover:text-[#6c8eff]'
              : 'bg-[#6c8eff] text-white hover:bg-[#5577ff]'
          }`}
        >
          {editing ? (
            <>
              <X size={14} /> Cancel
            </>
          ) : (
            <>
              <Pencil size={14} /> Edit
            </>
          )}
        </button>
      </div>

      {editing ? (
        /* Edit Form */
        <form onSubmit={handleSave}>
          <div className="bg-[#13161d] border border-[#252a38] rounded-xl p-6 space-y-4">
            {(
              [
                ['name', 'Company Name *', Briefcase],
                ['description', 'Description', AlignLeft],
                ['website', 'Website', Globe],
                ['industry', 'Industry', Briefcase],
                ['location', 'Location', MapPin],
                ['logo_url', 'Logo URL', Image],
              ] as [keyof CompanyUpdateRequest, string, React.ElementType][]
            ).map(([field, label, Icon]) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider flex items-center gap-1">
                  <Icon size={12} />
                  {label}
                </label>

                {field === 'description' ? (
                  <textarea
                  aria-label={label}
                    rows={3}
                    value={(form[field] as string) ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, [field]: e.target.value })
                    }
                    className="bg-[#1a1e28] border border-[#252a38] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c8eff] resize-y"
                  />
                ) : (
                  <input
                  aria-label={label}
                    value={(form[field] as string) ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, [field]: e.target.value })
                    }
                    required={field === 'name'}
                    className="bg-[#1a1e28] border border-[#252a38] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#6c8eff]"
                  />
                )}
              </div>
            ))}

            {saveError && (
              <p className="text-[#f87171] text-sm">⚠ {saveError}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-[#6c8eff] text-white hover:bg-[#5577ff] transition"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={14} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Detail View */
        <div className="grid gap-4 md:grid-cols-2">
          <DetailCard icon={<Briefcase size={15} />} label="Name" value={company.name} />
          <DetailCard icon={<AlignLeft size={15} />} label="Description" value={company.description ?? '—'} />
          <DetailCard icon={<Globe size={15} />} label="Website" value={company.website ?? '—'} link={company.website ?? undefined} />
          <DetailCard icon={<Briefcase size={15} />} label="Industry" value={company.industry ?? '—'} />
          <DetailCard icon={<MapPin size={15} />} label="Location" value={company.location ?? '—'} />
          <DetailCard icon={<Image size={15} />} label="Logo URL" value={company.logo_url ?? '—'} link={company.logo_url ?? undefined} />
          <DetailCard icon={<AlignLeft size={15} />} label="Created At" value={new Date(company.created_at).toLocaleString()} />
          <DetailCard icon={<AlignLeft size={15} />} label="Updated At" value={new Date(company.updated_at).toLocaleString()} />
        </div>
      )}
    </>
  );
}

function DetailCard({
  icon,
  label,
  value,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  link?: string;
}) {
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
          className="text-sm text-[#6c8eff] break-all hover:underline"
        >
          {value}
        </a>
      ) : (
        <p
          className={`text-sm break-all ${
            value === '—' ? 'text-[#6b7280]' : 'text-white'
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}