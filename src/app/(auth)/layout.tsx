import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/50">
      <div className="mb-8">
        <Link href="/">
          <Logo className="h-12 w-auto" />
        </Link>
      </div>
      {children}
    </div>
  );
}
