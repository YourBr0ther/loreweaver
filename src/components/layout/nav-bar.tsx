'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { LoreweaverLogo } from './logo';
import { SearchCommand } from './search-command';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  BookOpen,
  Globe,
  ScrollText,
  AlertCircle,
  Clock,
  Settings,
  Search,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Codex', href: '/codex', icon: BookOpen },
  { label: 'Web', href: '/web', icon: Globe },
  { label: 'Sessions', href: '/sessions', icon: ScrollText },
  { label: 'Timeline', href: '/timeline', icon: Clock },
  { label: 'Review', href: '/review', icon: AlertCircle },
];

export function NavBar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    async function fetchPending() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const stats = await res.json();
          setPendingCount(stats.pendingReview ?? 0);
        }
      } catch {
        // Silently fail — stats are non-critical
      }
    }
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1e1e2e] bg-[#0a0a0f]/95 backdrop-blur-md">
      {/* Decorative web thread along top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8b7ec8]/30 to-transparent" />

      <div className="mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5 mr-8">
          <LoreweaverLogo size="sm" className="transition-transform duration-300 group-hover:rotate-12" />
          <span
            className="text-lg font-semibold tracking-wide text-[#e2e0ef]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Loreweaver
          </span>
        </Link>

        {/* Navigation tabs */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            const showBadge = item.href === '/review' && pendingCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-[#8b7ec8] bg-[#8b7ec8]/10'
                    : 'text-[#e2e0ef]/60 hover:text-[#e2e0ef] hover:bg-[#e2e0ef]/5'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {showBadge && (
                  <Badge
                    variant="destructive"
                    className="ml-1 h-5 min-w-5 px-1.5 text-[10px] font-bold bg-[#d4a574] text-[#0a0a0f] hover:bg-[#d4a574]/90 border-none"
                  >
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </Badge>
                )}
                {/* Active indicator line */}
                {isActive && (
                  <span className="absolute -bottom-[9px] left-3 right-3 h-px bg-[#8b7ec8]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-[#e2e0ef]/30 hover:text-[#e2e0ef]/60 hover:bg-[#e2e0ef]/5 transition-colors border border-transparent hover:border-[#1e1e2e]"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-flex items-center px-1 py-0 rounded text-[10px] font-mono text-[#e2e0ef]/15 bg-[#0a0a0f] border border-[#1e1e2e]">
              &thinsp;&#8984;K&thinsp;
            </kbd>
          </button>
          {pendingCount > 0 && (
            <Link
              href="/review"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[#d4a574] bg-[#d4a574]/10 hover:bg-[#d4a574]/15 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d4a574] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4a574]" />
              </span>
              {pendingCount} pending
            </Link>
          )}
          <Link
            href="/settings"
            className="p-2 rounded-md text-[#e2e0ef]/40 hover:text-[#e2e0ef]/70 hover:bg-[#e2e0ef]/5 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>

        {/* Search command palette */}
        <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>

      {/* Decorative web thread along bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#8b7ec8]/15 to-transparent" />
    </nav>
  );
}
