'use client';

import Link from 'next/link';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
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
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

interface NavLink {
  href: (params: any, searchParams?: URLSearchParams) => string;
  icon: React.ReactNode;
  label: string;
  isMain?: boolean;
  isRoomView?: boolean;
  requiredRole: 'chairperson' | 'student' | 'any';
  id?: string;
}

const navLinks: NavLink[] = [
  // Chairperson
  { href: () => '/chairperson/dashboard', icon: <Home />, label: 'Dashboard', isMain: true, requiredRole: 'chairperson' },
  { href: () => '/chairperson/rooms', icon: <Users />, label: 'Rooms', isMain: true, requiredRole: 'chairperson' },
  { href: (params) => `/chairperson/rooms/${params.id}`, icon: <Home />, label: 'Room Dashboard', isRoomView: true, requiredRole: 'chairperson' },
  { href: (params) => `/chairperson/rooms/${params.id}/expenses`, icon: <Wallet />, label: 'Expenses', isRoomView: true, requiredRole: 'chairperson' },
  { href: (params) => `/chairperson/rooms/${params.id}/deadlines`, icon: <CalendarCheck />, label: 'Fund Deadlines', isRoomView: true, requiredRole: 'chairperson' },
  { href: (params) => `/chairperson/rooms/${params.id}/students`, icon: <Users />, label: 'Students', isRoomView: true, requiredRole: 'chairperson' },
  { href: (params) => `/chairperson/rooms/${params.id}/statements`, icon: <FileText />, label: 'Statements', isRoomView: true, requiredRole: 'chairperson' },
  { href: (params) => `/chairperson/rooms/${params.id}/graphs`, icon: <AreaChart />, label: 'Analytics', isRoomView: true, requiredRole: 'chairperson' },
  
  // Student
  { href: () => '/student/dashboard', icon: <Home />, label: 'Dashboard', isMain: true, requiredRole: 'student' },
  { href: () => '/student/rooms', icon: <Users />, label: 'My Rooms', isMain: true, requiredRole: 'student' },
  { id: 'dashboard', href: (params, sp) => `/student/rooms/${params.id}?${new URLSearchParams({ chairpersonId: sp?.get('chairpersonId') || '', view: 'dashboard' })}`, icon: <LayoutDashboard />, label: 'My Dashboard', isRoomView: true, requiredRole: 'student' },
  { id: 'expenses', href: (params, sp) => `/student/rooms/${params.id}?${new URLSearchParams({ chairpersonId: sp?.get('chairpersonId') || '', view: 'expenses' })}`, icon: <Wallet />, label: 'Expenses', isRoomView: true, requiredRole: 'student' },
  { id: 'deadlines', href: (params, sp) => `/student/rooms/${params.id}?${new URLSearchParams({ chairpersonId: sp?.get('chairpersonId') || '', view: 'deadlines' })}`, icon: <CalendarCheck />, label: 'Deadlines', isRoomView: true, requiredRole: 'student' },
  { id: 'statements', href: (params, sp) => `/student/rooms/${params.id}?${new URLSearchParams({ chairpersonId: sp?.get('chairpersonId') || '', view: 'statements' })}`, icon: <FileText />, label: 'Statements', isRoomView: true, requiredRole: 'student' },
];


export function DashboardSidebar({ role }: { role: 'chairperson' | 'student' }) {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const isChairpersonRoomView = role === 'chairperson' && pathname.includes('/chairperson/rooms/') && params.id;
  const isStudentRoomView = role === 'student' && pathname.includes('/student/rooms/') && params.id;

  const activeView = searchParams.get('view') || 'dashboard';

  const getVisibleLinks = () => {
    if (role === 'chairperson') {
      return navLinks.filter(link => link.requiredRole === 'chairperson' && (isChairpersonRoomView ? link.isRoomView : link.isMain));
    }
    if (role === 'student') {
        if (isStudentRoomView) {
            return navLinks.filter(link => link.requiredRole === 'student' && link.isRoomView);
        }
        return navLinks.filter(link => link.requiredRole === 'student' && link.isMain);
    }
    return [];
  }

  const visibleLinks = getVisibleLinks();

  const isActive = (link: NavLink) => {
    if (isStudentRoomView) {
      return link.id === activeView;
    }
    return pathname === link.href(params);
  };


  return (
    <div className="fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r">
        <aside className="hidden border-r bg-background sm:flex sm:flex-col">
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
            <Link href={`/${role}/dashboard`}>
                <Logo className="h-12 w-auto" />
            </Link>
            <TooltipProvider>
            {visibleLinks.map((link) => (
                <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                    <Link
                    href={link.href(params, searchParams)}
                    className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                        isActive(link) && 'bg-accent text-accent-foreground'
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
