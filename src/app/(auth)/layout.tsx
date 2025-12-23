import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-muted/50 p-4">
      <div className="absolute left-4 top-4 md:left-8 md:top-8">
        <Link href="/">
          <Button variant="outline" size="icon" className="h-12 w-12">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Home</span>
          </Button>
        </Link>
      </div>
      <div className="mb-8">
        <Link href="/">
          <Logo className="h-20 w-auto" />
        </Link>
      </div>
      {children}
    </div>
  );
}
