'use client';

import { NavBar } from './nav-bar';
import { Toaster } from '@/components/ui/sonner';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e2e0ef]">
      {/* Subtle radial gradient background for depth */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_#12121a_0%,_#0a0a0f_70%)] pointer-events-none" />

      <div className="relative z-10">
        <NavBar />
        <main className="mx-auto max-w-screen-2xl px-4 py-6">
          {children}
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#12121a',
            border: '1px solid #1e1e2e',
            color: '#e2e0ef',
          },
        }}
      />
    </div>
  );
}
