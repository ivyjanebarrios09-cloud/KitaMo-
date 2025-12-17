'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Users, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const navigationCards = [
  {
    title: 'Manage Rooms',
    description: 'Create, view, and manage your financial rooms.',
    icon: <Users className="h-8 w-8 text-primary" />,
    href: '/chairperson/rooms',
  },
  {
    title: 'Account Settings',
    description: 'Update your profile and notification preferences.',
    icon: <Settings className="h-8 w-8 text-primary" />,
    href: '/settings',
  },
];

export default function ChairpersonDashboard() {
  const router = useRouter();

  const handleCardClick = (href: string) => {
    router.push(href);
  };

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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Select an option below to get started.
          </p>
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
