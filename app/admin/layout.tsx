'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Companies', href: '/admin/companies', icon: Building2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#0d0f14] text-[#e8eaf0] font-sans">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 z-40 w-[220px] bg-[#13161d] border-r border-[#252a38] flex flex-col px-3 py-6">
        
        {/* Brand */}
        <div className="flex items-center gap-2 px-2 pb-6 mb-5 border-b border-[#252a38] text-[#6c8eff] font-bold tracking-wide">
          <ShieldCheck size={22} strokeWidth={1.8} />
          <span className="text-sm">Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active =
              href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  active
                    ? 'text-[#6c8eff] bg-[rgba(108,142,255,0.12)]'
                    : 'text-[#6b7280] hover:text-[#e8eaf0] hover:bg-[#1a1e28]'
                }`}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button className="mt-auto flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-[#6b7280] hover:text-[#f87171] hover:bg-[rgba(248,113,113,0.08)] transition-all">
          <LogOut size={16} strokeWidth={1.8} />
          <span>Sign out</span>
        </button>
      </aside>

      {/* Main */}
      <main className="ml-[220px] flex-1 p-10">
        {children}
      </main>
    </div>
  );
}