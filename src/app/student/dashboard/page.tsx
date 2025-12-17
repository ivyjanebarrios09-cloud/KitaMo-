'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Users, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

const navigationCards = [
  {
    title: 'View My Rooms',
    description: 'Check your payment status and deadlines for each room.',
    icon: <Users className="h-8 w-8 text-primary" />,
    href: '/student/rooms',
  },
  {
    title: 'Account Settings',
    description: 'Update your profile and notification preferences.',
    icon: <Settings className="h-8 w-8 text-primary" />,
    href: '/settings',
  },
];

export default function StudentDashboard() {
  const router = useRouter();

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome! Here is your financial overview.
        </p>
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
