import Link from 'next/link';
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/user-nav';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 sm:static sm:h-auto sm:border-0 sm:bg-transparent">
      <div className="flex h-full items-center sm:hidden">
        <Link href="/dashboard">
          <Logo className="h-14 w-auto" />
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}
