'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useUser, useDoc } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Expense, Room } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { format } from 'date-fns';

const chartConfig = {
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--primary))',
  },
};

export default function RoomGraphsPage({ params }: { params: { id: string } }) {
  const roomId = params.id;
  const { user, loading: userLoading } = useUser();
  const { data: room, loading: roomLoading } = useDoc<Room>(
    user ? `users/${user.uid}/rooms/${roomId}` : null
  );

  const expensesQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'users', user.uid, 'rooms', roomId, 'expenses')
    );
  }, [user, roomId]);

  const {
    data: expenses,
    loading: expensesLoading,
    db,
  } = useCollection<Expense>(expensesQuery);

  const { monthlyData, yearlyData } = useMemo(() => {
    if (!expenses) return { monthlyData: [], yearlyData: [] };

    const monthly: { [key: string]: number } = {};
    const yearly: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthYear = format(date, 'MMM yyyy');
      const year = format(date, 'yyyy');

      monthly[monthYear] = (monthly[monthYear] || 0) + expense.amount;
      yearly[year] = (yearly[year] || 0) + expense.amount;
    });

    const monthlyData = Object.entries(monthly)
      .map(([name, total]) => ({
        name,
        expenses: total,
      }))
      .sort((a, b) => new Date(a.name) as any - (new Date(b.name) as any));

    const yearlyData = Object.entries(yearly)
      .map(([name, total]) => ({
        name,
        expenses: total,
      }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));

    return { monthlyData, yearlyData };
  }, [expenses]);

  const loading = userLoading || roomLoading || expensesLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/chairperson/rooms/${roomId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Expense Analytics</h1>
          <p className="text-muted-foreground">
            Visualizing financial data for: {room?.name}
          </p>
        </div>
      </div>

      {expenses && expenses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
              <CardDescription>
                Total expenses aggregated by month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={monthlyData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Legend />
                  <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Yearly Expenses</CardTitle>
              <CardDescription>
                Total expenses aggregated by year.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={yearlyData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Legend />
                  <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center h-[400px]">
          <BarChart2 className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">No Expense Data</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Once you add expenses to this room, graphs will appear here.
          </p>
          <Link href={`/chairperson/rooms/${roomId}`}>
            <Button variant="outline">Go to Expenses Tab</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
