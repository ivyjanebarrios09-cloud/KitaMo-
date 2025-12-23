'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

export default function ChairpersonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader />
      <div className="flex flex-1 pl-[56px]">
        <DashboardSidebar role="chairperson" />
        <main className="flex-1 overflow-y-auto p-4 sm:px-6 sm:py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
