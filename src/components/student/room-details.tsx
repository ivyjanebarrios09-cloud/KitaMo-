'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Room } from '@/lib/types';
import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import { Expense, FundDeadline } from '@/lib/types';
import { format } from 'date-fns';
import { GeneratePersonalStatement } from './generate-personal-statement';

interface StudentRoomDetailsProps {
    room: Room;
    roomId: string;
    chairpersonId: string;
    studentId: string;
}

export function StudentRoomDetails({ room, roomId, chairpersonId, studentId }: StudentRoomDetailsProps) {
    const db = useFirestore();

    const expensesQuery = useMemo(() => {
        if (!chairpersonId || !roomId) return null;
        return query(collection(db, `users/${chairpersonId}/rooms/${roomId}/expenses`));
    }, [db, chairpersonId, roomId]);

    const deadlinesQuery = useMemo(() => {
        if (!chairpersonId || !roomId) return null;
        return query(collection(db, `users/${chairpersonId}/rooms/${roomId}/deadlines`));
    }, [db, chairpersonId, roomId]);

    const { data: expenses, loading: expensesLoading } = useCollection<Expense>(expensesQuery);
    const { data: deadlines, loading: deadlinesLoading } = useCollection<FundDeadline>(deadlinesQuery);

  return (
    <Tabs defaultValue="dashboard">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="dashboard">My Dashboard</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
        <TabsTrigger value="statements">Statements</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Your Financial Summary</CardTitle>
            <CardDescription>For &apos;{room.name}&apos;</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Current Balance</h3>
                <p className="text-4xl font-bold text-red-600">₱0.00 <span className="text-lg font-normal text-muted-foreground">due</span></p>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>Payment Progress</span>
                    <span>0%</span>
                </div>
                <Progress value={0} />
                 <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Paid: ₱0.00</span>
                    <span>Total: ₱0.00</span>
                </div>
            </div>
             <p className="text-sm text-muted-foreground text-center pt-4">Real-time balance and payment tracking is coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="expenses">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Room Expenses</CardTitle>
            <CardDescription>All expenses posted for this room.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expensesLoading && <TableRow><TableCell colSpan={3} className="text-center">Loading expenses...</TableCell></TableRow>}
                    {!expensesLoading && expenses?.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No expenses posted yet.</TableCell></TableRow>}
                    {expenses?.map(expense => (
                        <TableRow key={expense.id}>
                            <TableCell>{format(new Date(expense.date), 'PP')}</TableCell>
                            <TableCell>{expense.title}</TableCell>
                            <TableCell className="text-right">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(expense.amount)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="deadlines">
         <Card className="mt-4">
          <CardHeader>
            <CardTitle>Fund Deadlines</CardTitle>
            <CardDescription>Upcoming and past due payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount Required</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {deadlinesLoading && <TableRow><TableCell colSpan={5} className="text-center">Loading deadlines...</TableCell></TableRow>}
                    {!deadlinesLoading && deadlines?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No deadlines posted yet.</TableCell></TableRow>}
                    {deadlines?.map(deadline => {
                        // TODO: Replace with actual payment status logic
                        const isPaid = false; 
                        return (
                            <TableRow key={deadline.id}>
                                <TableCell className="font-medium">{deadline.title}</TableCell>
                                <TableCell>{format(new Date(deadline.dueDate), 'PP')}</TableCell>
                                <TableCell>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(deadline.amountPerStudent)}</TableCell>
                                <TableCell>₱0.00</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={isPaid ? 'secondary' : 'destructive'}>
                                        {isPaid ? 'Paid' : 'Unpaid'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
             <p className="text-sm text-muted-foreground text-center pt-4">Payment functionality is coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="statements">
        <GeneratePersonalStatement room={room} roomId={roomId} chairpersonId={chairpersonId} />
      </TabsContent>
    </Tabs>
  );
}
