
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { ArrowLeft, Wallet, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, getDocs } from 'firebase/firestore';
import type { JoinedRoom, Expense, FundDeadline } from '@/lib/types';
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

type AggregatedEvent = (
    (Expense & { type: 'expense', roomName: string, roomId: string, chairpersonId: string }) | 
    (FundDeadline & { type: 'deadline', roomName: string, roomId: string, chairpersonId: string })
);

export default function StudentDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const joinedRoomsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'joinedRooms'));
  }, [db, user]);

  const { data: joinedRooms, loading: roomsLoading } = useCollection<JoinedRoom>(joinedRoomsQuery);
  
  const [aggregatedData, setAggregatedData] = useState<AggregatedEvent[]>([]);
  const [aggregationLoading, setAggregationLoading] = useState(true);

  useEffect(() => {
    if (!joinedRooms || !db) return;

    const aggregateData = async () => {
        setAggregationLoading(true);
        const allEvents: AggregatedEvent[] = [];

        for (const room of joinedRooms) {
            const { chairpersonId, roomId, roomName } = room;
            
            // Fetch Deadlines
            const deadlinesRef = collection(db, `users/${chairpersonId}/rooms/${roomId}/deadlines`);
            const deadlinesSnap = await getDocs(deadlinesRef);
            deadlinesSnap.forEach(doc => {
                allEvents.push({ 
                    ...doc.data() as FundDeadline, 
                    id: doc.id, 
                    type: 'deadline', 
                    roomName,
                    roomId,
                    chairpersonId
                });
            });

            // Fetch Expenses
            const expensesRef = collection(db, `users/${chairpersonId}/rooms/${roomId}/expenses`);
            const expensesSnap = await getDocs(expensesRef);
            expensesSnap.forEach(doc => {
                allEvents.push({ 
                    ...doc.data() as Expense, 
                    id: doc.id, 
                    type: 'expense', 
                    roomName,
                    roomId,
                    chairpersonId
                });
            });
        }
        
        // Sort by date, most recent first
        allEvents.sort((a, b) => {
            const dateA = new Date('dueDate' in a ? a.dueDate : a.date).getTime();
            const dateB = new Date('dueDate' in b ? b.dueDate : b.date).getTime();
            return dateB - dateA;
        });
        
        setAggregatedData(allEvents);
        setAggregationLoading(false);
    };

    if (joinedRooms.length > 0) {
      aggregateData();
    } else {
      setAggregationLoading(false);
    }

  }, [joinedRooms, db]);


  const loading = userLoading || roomsLoading || aggregationLoading;

  const welcomeMessage = loading
    ? <Skeleton className="h-6 w-64 mt-1" />
    : <p className="text-muted-foreground">
        Welcome, {user?.displayName}! Here's the latest activity from your rooms.
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
      
      <Card>
        <CardHeader>
            <CardTitle>Recent History</CardTitle>
            <CardDescription>The latest deadlines and expenses across all of your joined rooms.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && Array.from({length: 5}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={5}><Skeleton className="h-5 w-full" /></TableCell>
                        </TableRow>
                    ))}
                    {!loading && aggregatedData.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No activity in your rooms yet.</TableCell>
                        </TableRow>
                    )}
                    {!loading && aggregatedData.map((event) => {
                        const date = 'dueDate' in event ? event.dueDate : event.date;
                        const amount = 'amountPerStudent' in event ? event.amountPerStudent : event.amount;
                        return (
                            <TableRow key={`${event.type}-${event.id}`}>
                                <TableCell>
                                    <Badge variant={event.type === 'expense' ? 'outline' : 'secondary'} className="gap-1">
                                       {event.type === 'expense' ? <Wallet className="h-3 w-3" /> : <CalendarCheck className="h-3 w-3" />}
                                       {event.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>{format(new Date(date), 'PP')}</TableCell>
                                <TableCell>
                                    <Button variant="link" asChild className="p-0 h-auto font-normal">
                                        <Link href={`/student/rooms/${event.roomId}?chairpersonId=${event.chairpersonId}`}>
                                            {event.roomName}
                                        </Link>
                                    </Button>
                                </TableCell>
                                <TableCell>{event.title}</TableCell>
                                <TableCell className="text-right font-medium">
                                     {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

  