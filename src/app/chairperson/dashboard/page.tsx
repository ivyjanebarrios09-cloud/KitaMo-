'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { ArrowLeft, Users, Wallet, PiggyBank, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, getDocs } from 'firebase/firestore';
import type { Room } from '@/lib/types';
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

// Simplified types for dashboard aggregation
type AggregatedExpense = { id: string; type: 'expense'; date: string; title: string; amount: number; roomId: string; roomName: string; };
type AggregatedPayment = { id: string; type: 'payment'; date: string; note?: string; amount: number; roomId: string; roomName: string; deadlineId?: string; };
type AggregatedDeadline = { id: string; type: 'deadline'; dueDate: string; title: string; amountPerStudent: number; roomId: string; roomName: string; };
type Transaction = AggregatedExpense | AggregatedPayment | AggregatedDeadline;
type RoomMember = { id: string; userId: string; };


function FinancialSummaryCard({ title, value, icon, loading }: { title: string, value: string | number, icon: React.ReactNode, loading: boolean }) {
  const isStudentCount = title === 'Total Students';

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
            {typeof value === 'number' && !isStudentCount
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
    expenses: AggregatedExpense[];
    payments: AggregatedPayment[];
    deadlines: AggregatedDeadline[];
    members: RoomMember[];
  }>({ expenses: [], payments: [], deadlines: [], members: [] });
  const [aggregationLoading, setAggregationLoading] = useState(true);

  useEffect(() => {
    if (!rooms || !user?.uid || !db) return;

    const aggregateData = async () => {
        setAggregationLoading(true);
        const expensesPromises = rooms.map(room => getDocs(collection(db, `users/${user.uid}/rooms/${room.id}/expenses`)).then(snap => ({ snap, room })));
        const paymentsPromises = rooms.map(room => getDocs(collection(db, `users/${user.uid}/rooms/${room.id}/payments`)).then(snap => ({ snap, room })));
        const deadlinesPromises = rooms.map(room => getDocs(collection(db, `users/${user.uid}/rooms/${room.id}/deadlines`)).then(snap => ({ snap, room })));
        const membersPromises = rooms.map(room => getDocs(collection(db, `users/${user.uid}/rooms/${room.id}/members`)));

        const [expenseResults, paymentResults, deadlineResults, memberResults] = await Promise.all([
             Promise.all(expensesPromises),
             Promise.all(paymentsPromises),
             Promise.all(deadlinesPromises),
             Promise.all(membersPromises)
        ]);

        const allExpenses = expenseResults.flatMap(({ snap, room }) => snap.docs.map(doc => ({...doc.data(), id: doc.id, type: 'expense', roomId: room.id, roomName: room.name } as AggregatedExpense)));
        const allPayments = paymentResults.flatMap(({ snap, room }) => snap.docs.map(doc => ({...doc.data(), id: doc.id, type: 'payment', roomId: room.id, roomName: room.name } as AggregatedPayment)));
        const allDeadlines = deadlineResults.flatMap(({ snap, room }) => snap.docs.map(doc => ({ ...doc.data(), id: doc.id, type: 'deadline', roomId: room.id, roomName: room.name } as AggregatedDeadline)));
        const allMembers = memberResults.flatMap(snap => snap.docs.map(doc => ({...doc.data(), id: doc.id } as RoomMember)));
        
        setAggregatedData({ expenses: allExpenses, payments: allPayments, deadlines: allDeadlines, members: allMembers });
        setAggregationLoading(false);
    };

    if (rooms.length > 0) {
      aggregateData();
    } else {
      setAggregationLoading(false);
    }

  }, [rooms, db, user?.uid]);


  const { totalCollected, totalExpenses, totalStudents, recentTransactions } = useMemo(() => {
    const collected = aggregatedData.payments.reduce((sum, p) => sum + p.amount, 0);
    const expenses = aggregatedData.expenses.reduce((sum, e) => sum + e.amount, 0);

    const combined: Transaction[] = [...aggregatedData.expenses, ...aggregatedData.payments, ...aggregatedData.deadlines];
    combined.sort((a, b) => {
        const dateA = new Date('date' in a ? a.date : a.dueDate).getTime();
        const dateB = new Date('date' in b ? b.date : b.dueDate).getTime();
        return dateB - dateA;
    });
    
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
        <Link href="/" className="sm:hidden">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Dashboard</h1>
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
            icon={<span className="text-muted-foreground font-bold">₱</span>}
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
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && Array.from({length: 5}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={6}><Skeleton className="h-5 w-full" /></TableCell>
                        </TableRow>
                    ))}
                    {!loading && recentTransactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">No transactions yet.</TableCell>
                        </TableRow>
                    )}
                    {!loading && recentTransactions.map((tx) => {
                        const date = 'date' in tx ? tx.date : tx.dueDate;
                        const amount = tx.type === 'deadline' ? tx.amountPerStudent : tx.amount;
                        const description = tx.type === 'payment' ? tx.note : tx.title;
                        const badgeVariant = tx.type === 'expense' ? 'destructive' : (tx.type === 'deadline' ? 'outline' : 'secondary');
                        
                        let status: React.ReactNode = null;
                        if (tx.type === 'deadline') {
                            const hasPayment = aggregatedData.payments.some(p => p.deadlineId === tx.id);
                            status = <Badge variant={hasPayment ? 'secondary' : 'destructive'}>{hasPayment ? 'Paid' : 'Unpaid'}</Badge>;
                        }

                        return(
                        <TableRow key={`${tx.type}-${tx.id}`}>
                            <TableCell>
                                <Badge variant={badgeVariant}>{tx.type}</Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{format(new Date(date), 'PP')}</TableCell>
                            <TableCell>
                                <Button variant="link" asChild className="p-0 h-auto font-normal">
                                    <Link href={`/chairperson/rooms/${tx.roomId}`}>
                                        {tx.roomName}
                                    </Link>
                                </Button>
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">{description}</TableCell>
                            <TableCell className="hidden sm:table-cell">{status}</TableCell>
                            <TableCell className="text-right font-medium">
                                 {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)}
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
