'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const navigationCards = [
  {
    title: 'My Rooms',
    description: 'Check your payment status and deadlines for each room.',
    icon: <Users className="h-8 w-8 text-primary" />,
    href: '/student/rooms',
  },
];

export default function StudentDashboard() {
  const router = useRouter();
  const { user, loading } = useUser();

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  const welcomeMessage = loading ? (
    <Skeleton className="h-6 w-52 mt-1" />
  ) : (
    <p className="text-muted-foreground">
      Welcome, {user?.displayName}! Select an option to manage your finances.
    </p>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          {welcomeMessage}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {navigationCards.map((card) => (
          <Card
            key={card.title}
            className="group cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={() => handleCardClick(card.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-3">
                  {card.icon}
                  {card.title}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
