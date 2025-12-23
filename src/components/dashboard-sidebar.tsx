'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Home,
  Users,
  Wallet,
  CalendarCheck,
  FileText,
  AreaChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

interface NavLink {
  href: (params: any) => string;
  icon: React.ReactNode;
  label: string;
  isMain: boolean;
}

const chairpersonNavLinks: NavLink[] = [
  { href: () => '/chairperson/dashboard', icon: <Home />, label: 'Dashboard', isMain: true },
  { href: () => '/chairperson/rooms', icon: <Users />, label: 'Rooms', isMain: true },
  { href: (params) => `/chairperson/rooms/${params.id}`, icon: <Home />, label: 'Room Dashboard', isMain: false },
  { href: (params) => `/chairperson/rooms/${params.id}/expenses`, icon: <Wallet />, label: 'Expenses', isMain: false },
  { href: (params) => `/chairperson/rooms/${params.id}/deadlines`, icon: <CalendarCheck />, label: 'Fund Deadlines', isMain: false },
  { href: (params) => `/chairperson/rooms/${params.id}/students`, icon: <Users />, label: 'Students', isMain: false },
  { href: (params) => `/chairperson/rooms/${params.id}/statements`, icon: <FileText />, label: 'Statements', isMain: false },
  { href: (params) => `/chairperson/rooms/${params.id}/graphs`, icon: <AreaChart />, label: 'Analytics', isMain: false },
];

const studentNavLinks: NavLink[] = [
    { href: () => '/student/dashboard', icon: <Home />, label: 'Dashboard', isMain: true },
    { href: () => '/student/rooms', icon: <Users />, label: 'My Rooms', isMain: true },
];

export function DashboardSidebar({ role }: { role: 'chairperson' | 'student' }) {
  const pathname = usePathname();
  const params = useParams();
  const isRoomView = pathname.includes('/chairperson/rooms/') && params.id;
  
  const navLinks = role === 'chairperson' 
    ? chairpersonNavLinks.filter(link => isRoomView ? !link.isMain : link.isMain)
    : studentNavLinks;

  return (
    <div className="fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r">
        <aside className="hidden border-r bg-background sm:flex sm:flex-col">
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
            <Link href={`/${role}/dashboard`}>
                <Logo className="h-12 w-auto" />
            </Link>
            <TooltipProvider>
            {navLinks.map((link) => (
                <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                    <Link
                    href={link.href(params)}
                    className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                        pathname === link.href(params) && 'bg-accent text-accent-foreground'
                    )}
                    >
                    {link.icon}
                    <span className="sr-only">{link.label}</span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{link.label}</TooltipContent>
                </Tooltip>
            ))}
            </TooltipProvider>
        </nav>
        </aside>
    </div>
  );
}
