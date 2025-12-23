'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { ArrowLeft, Users, Wallet, PiggyBank, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, getDocs } from 'firebase/firestore';
import type { Room, Expense, Payment, RoomMember } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

function FinancialSummaryCard({ title, value, icon, loading }: { title: string, value: string | number, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className="text-2xl font-bold">
            {typeof value === 'number'
              ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
              : value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function ChairpersonDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const roomsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'rooms'));
  }, [db, user]);
  const { data: rooms, loading: roomsLoading } = useCollection<Room>(roomsQuery);
  
  const [aggregatedData, setAggregatedData] = useState<{
    expenses: (Expense & { type: 'expense' })[];
    payments: (Payment & { type: 'payment' })[];
    members: RoomMember[];
  }>({ expenses: [], payments: [], members: [] });
  const [aggregationLoading, setAggregationLoading] = useState(true);

  useEffect(() => {
    if (!rooms || !user?.uid || !db) return;

    const aggregateData = async () => {
        setAggregationLoading(true);
        const expensesPromises = rooms.map(room => getDocs(collection(db, `users/${user.uid}/rooms/${room.id}/expenses`)));
        const paymentsPromises = rooms.map(room => getDocs(collection(db, `users/${user.uid}/rooms/${room.id}/payments`)));
        const membersPromises = rooms.map(room => getDocs(collection(db, `users/${user.uid}/rooms/${room.id}/members`)));

        const [expenseSnapshots, paymentSnapshots, memberSnapshots] = await Promise.all([
             Promise.all(expensesPromises),
             Promise.all(paymentsPromises),
             Promise.all(membersPromises)
        ]);

        const allExpenses = expenseSnapshots.flatMap(snap => snap.docs.map(doc => ({...doc.data(), id: doc.id, type: 'expense'} as Expense & { type: 'expense' })));
        const allPayments = paymentSnapshots.flatMap(snap => snap.docs.map(doc => ({...doc.data(), id: doc.id, type: 'payment'} as Payment & { type: 'payment' })));
        const allMembers = memberSnapshots.flatMap(snap => snap.docs.map(doc => ({...doc.data(), id: doc.id } as RoomMember)));
        
        setAggregatedData({ expenses: allExpenses, payments: allPayments, members: allMembers });
        setAggregationLoading(false);
    };

    aggregateData();

  }, [rooms, db, user?.uid]);


  const { totalCollected, totalExpenses, totalStudents, recentTransactions } = useMemo(() => {
    const collected = aggregatedData.payments.reduce((sum, p) => sum + p.amount, 0);
    const expenses = aggregatedData.expenses.reduce((sum, e) => sum + e.amount, 0);

    const combined = [...aggregatedData.expenses, ...aggregatedData.payments];
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
      totalCollected: collected,
      totalExpenses: expenses,
      totalStudents: aggregatedData.members.length,
      recentTransactions: combined.slice(0, 10),
    };
  }, [aggregatedData]);


  const loading = userLoading || roomsLoading || aggregationLoading;

  const welcomeMessage = loading
    ? <Skeleton className="h-6 w-64 mt-1" />
    : <p className="text-muted-foreground">
        Welcome back, {user?.displayName}! Here's an overview of all your rooms.
      </p>

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
          {welcomeMessage}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <FinancialSummaryCard 
            title="Total Collected"
            value={totalCollected}
            icon={<PiggyBank className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
        />
        <FinancialSummaryCard 
            title="Total Expenses"
            value={totalExpenses}
            icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
        />
        <FinancialSummaryCard 
            title="Net Balance"
            value={totalCollected - totalExpenses}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
        />
        <FinancialSummaryCard 
            title="Total Students"
            value={totalStudents}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
        />
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Recent History</CardTitle>
            <CardDescription>The last 10 transactions across all of your rooms.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && Array.from({length: 5}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={4}><Skeleton className="h-5 w-full" /></TableCell>
                        </TableRow>
                    ))}
                    {!loading && recentTransactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">No transactions yet.</TableCell>
                        </TableRow>
                    )}
                    {!loading && recentTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                            <TableCell>
                                <Badge variant={tx.type === 'expense' ? 'destructive' : 'secondary'}>{tx.type}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(tx.date), 'PP')}</TableCell>
                            <TableCell>{tx.title || (tx as Payment).note}</TableCell>
                            <TableCell className="text-right font-medium">
                                 {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(tx.amount)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
