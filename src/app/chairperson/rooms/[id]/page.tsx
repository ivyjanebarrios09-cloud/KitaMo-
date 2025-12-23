'use client';

import React, { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useUser, useFirestore } from '@/firebase';
import type { Expense, Payment, RoomMember } from '@/lib/types';
import { DollarSign, Users, CreditCard } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function RoomStatCard({
  title,
  value,
  description,
  icon,
  loading,
  isCurrency = true,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  loading: boolean;
  isCurrency?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="mt-1 h-4 w-1/2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">
              {isCurrency && typeof value === 'number'
                ? new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(value)
                : value}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function RoomDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: roomId } = React.use(params);
  const { user } = useUser();
  const db = useFirestore();

  const membersQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'rooms', roomId, 'members'));
  }, [db, user, roomId]);

  const paymentsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'rooms', roomId, 'payments'));
  }, [db, user, roomId]);
  
  const expensesQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'rooms', roomId, 'expenses'));
  }, [db, user, roomId]);

  const { data: members, loading: membersLoading } = useCollection<RoomMember>(membersQuery);
  const { data: payments, loading: paymentsLoading } = useCollection<Payment>(paymentsQuery);
  const { data: expenses, loading: expensesLoading } = useCollection<Expense>(expensesQuery);

  const { totalCollected, totalExpenses, studentCount } = useMemo(() => {
    const collected = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
    const spent = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
    const membersCount = members?.length ?? 0;
    return {
      totalCollected: collected,
      totalExpenses: spent,
      studentCount: membersCount,
    };
  }, [payments, expenses, members]);

  const loading = membersLoading || paymentsLoading || expensesLoading;
  const netBalance = totalCollected - totalExpenses;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <DollarSign className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 mt-4">
        <RoomStatCard
          title="Total Balance"
          value={netBalance}
          description={`${new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
          }).format(totalCollected)} collected - ${new Intl.NumberFormat(
            'en-PH',
            { style: 'currency', currency: 'PHP' }
          ).format(totalExpenses)} spent`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <RoomStatCard
          title="Students"
          value={studentCount}
          description={`${studentCount} members have joined this room`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
          isCurrency={false}
        />
        <RoomStatCard
          title="Total Collected"
          value={totalCollected}
          description="Total funds received from students"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>
    </div>
  );
}
