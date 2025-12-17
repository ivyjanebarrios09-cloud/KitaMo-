import { DashboardHeader } from '@/components/dashboard-header';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader />
      <main className="flex-1 p-4 sm:px-6 sm:py-4">{children}</main>
    </div>
  );
}
