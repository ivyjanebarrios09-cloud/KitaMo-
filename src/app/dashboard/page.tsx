// This is a placeholder for a server component that would handle role-based redirection.
// In a real application, you would check the user's session and role,
// then use `redirect()` from `next/navigation` to send them to the correct dashboard.

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to FinanceFlow</CardTitle>
          <CardDescription>
            In a real application, you would be automatically redirected based on your role.
            For now, please select your destination.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-around">
          <Button asChild>
            <Link href="/chairperson/dashboard">Chairperson Dashboard</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/student/dashboard">Student Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
