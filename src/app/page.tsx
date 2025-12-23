
'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Users, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <Logo className="mx-auto h-24 w-auto" />
        <p className="text-muted-foreground">Loading your experience...</p>
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}


export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  if (loading || user) {
    return <LoadingScreen />;
  }
  
  const features = [
    {
      icon: <span className="h-8 w-8 text-primary text-3xl font-bold flex items-center justify-center">₱</span>,
      title: 'Effortless Expense Tracking',
      description: 'Easily post expenses and fund deadlines. Keep everyone in the loop with automated calculations and clear summaries.',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Seamless Member Management',
      description: 'Manage students, track payments, and view balances at a glance. Onboard new members with a simple, unique join code.',
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: 'AI-Powered Insights',
      description: 'Our smart assistant helps you craft clear, stress-free communication for fund deadlines, improving clarity and compliance.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-20 w-auto" />
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">
              Sign Up <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center md:py-24 lg:py-32">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-headline">
            Financial Clarity for Your Student Group
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            KitaMo! simplifies money management for clubs, teams, and organizations.
            Focus on your goals, not on spreadsheets.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started for Free</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">
              Everything You Need to Manage Group Finances
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              A powerful, yet simple suite of tools for financial chairpersons and members.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6">
                <CardContent className="flex flex-col items-center text-center gap-4 pt-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    {React.cloneElement(feature.icon, { className: 'h-8 w-8 text-primary' })}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-muted/50">
          <div className="container mx-auto px-4 py-16 text-center md:py-24 lg:py-32">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">
              Ready to Take Control?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Join hundreds of groups streamlining their finances with KitaMo!.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-4 py-6 md:px-6 gap-4">
        <div className="flex items-center gap-2">
          <Logo className="h-16 w-auto" />
        </div>
        <p className="text-sm text-muted-foreground text-center sm:text-right">
          &copy; {new Date().getFullYear()} KitaMo!. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
