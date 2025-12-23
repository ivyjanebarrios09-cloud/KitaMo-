'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import type { Room } from '@/lib/types';
import { useState, useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Expense, FundDeadline, Payment } from '@/lib/types';
import { format } from 'date-fns';
import { GeneratePersonalStatement } from './generate-personal-statement';
import { PiggyBank, Wallet, LayoutDashboard, CalendarCheck, FileText } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface StudentRoomDetailsProps {
    room: Room;
    roomId: string;
    chairpersonId: string;
    studentId: string;
}

type ActiveView = 'dashboard' | 'expenses' | 'deadlines' | 'statements';

const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
    { id: 'expenses', icon: Wallet, label: 'Expenses' },
    { id: 'deadlines', icon: CalendarCheck, label: 'Deadlines' },
    { id: 'statements', icon: FileText, label: 'Statements' },
] as const;

export function StudentRoomDetails({ room, roomId, chairpersonId, studentId }: StudentRoomDetailsProps) {
    const db = useFirestore();
    const [activeView, setActiveView] = useState<ActiveView>('dashboard');

    const expensesQuery = useMemo(() => {
        if (!chairpersonId || !roomId) return null;
        return query(collection(db, `users/${chairpersonId}/rooms/${roomId}/expenses`));
    }, [db, chairpersonId, roomId]);

    const deadlinesQuery = useMemo(() => {
        if (!chairpersonId || !roomId) return null;
        return query(collection(db, `users/${chairpersonId}/rooms/${roomId}/deadlines`));
    }, [db, chairpersonId, roomId]);

    const paymentsQuery = useMemo(() => {
        if (!chairpersonId || !roomId || !studentId) return null;
        return query(
            collection(db, `users/${chairpersonId}/rooms/${roomId}/payments`),
            where('userId', '==', studentId)
        );
    }, [db, chairpersonId, roomId, studentId]);

    const { data: expenses, loading: expensesLoading } = useCollection<Expense>(expensesQuery);
    const { data: deadlines, loading: deadlinesLoading } = useCollection<FundDeadline>(deadlinesQuery);
    const { data: payments, loading: paymentsLoading } = useCollection<Payment>(paymentsQuery);

    const { totalDue, totalPaid } = useMemo(() => {
        const due = deadlines?.reduce((sum, d) => sum + d.amountPerStudent, 0) ?? 0;
        const paid = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
        return { totalDue: due, totalPaid: paid };
    }, [deadlines, payments]);

    const totalUnpaid = totalDue - totalPaid;
    const paymentProgress = totalDue > 0 ? (totalPaid / totalDue) * 100 : 100;
    const loading = deadlinesLoading || paymentsLoading;

    const renderContent = () => {
        const activeItem = navItems.find(item => item.id === activeView);
        if (!activeItem) return null;
        
        const contentMap: Record<ActiveView, React.ReactNode> = {
            dashboard: (
                <div className="space-y-4">
                     <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Unpaid</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-8 w-3/4 mt-1" /> :
                            <div className="text-2xl font-bold text-red-600">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalUnpaid > 0 ? totalUnpaid : 0)}
                            </div>
                            }
                            <p className="text-xs text-muted-foreground">
                            Your outstanding balance for this room.
                            </p>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                            <PiggyBank className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-8 w-3/4 mt-1" /> :
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalPaid)}
                            </div>
                            }
                            <p className="text-xs text-muted-foreground">
                            Your total contributions to this room.
                            </p>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                            Overall Payment Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-4 w-full" /> : <Progress value={paymentProgress} className="mb-2" />}
                            <div className="text-xs text-muted-foreground text-center">
                            {loading ? <Skeleton className="h-4 w-3/4 mx-auto mt-2" /> : `You've paid ${paymentProgress.toFixed(0)}% of your total dues.`}
                            </div>
                        </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>A record of all payments you have made in this room.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Note / For</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentsLoading && <TableRow><TableCell colSpan={3} className="text-center">Loading history...</TableCell></TableRow>}
                                        {!paymentsLoading && payments?.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">You have not made any payments yet.</TableCell></TableRow>}
                                        {!paymentsLoading && payments?.map(payment => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{format(new Date(payment.date), 'PP')}</TableCell>
                                                <TableCell>{payment.note}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(payment.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ),
            expenses: (
                <Card>
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
            ),
            deadlines: (
                <Card>
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
                            {loading && <TableRow><TableCell colSpan={5} className="text-center">Loading deadlines...</TableCell></TableRow>}
                            {!loading && deadlines?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center">No deadlines posted yet.</TableCell></TableRow>}
                            {deadlines?.map(deadline => {
                                const paymentForDeadline = payments?.find(p => p.deadlineId === deadline.id);
                                const amountPaidForDeadline = paymentForDeadline?.amount ?? 0;
                                const isPaid = amountPaidForDeadline >= deadline.amountPerStudent;

                                return (
                                    <TableRow key={deadline.id}>
                                        <TableCell className="font-medium">{deadline.title}</TableCell>
                                        <TableCell>{format(new Date(deadline.dueDate), 'PP')}</TableCell>
                                        <TableCell>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(deadline.amountPerStudent)}</TableCell>
                                        <TableCell>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amountPaidForDeadline)}</TableCell>
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
                </CardContent>
                </Card>
            ),
            statements: (
                <GeneratePersonalStatement room={room} roomId={roomId} chairpersonId={chairpersonId} />
            )
        };
        
        return (
            <div className="w-full">
                <div className="flex items-center gap-4 mb-6">
                    <activeItem.icon className="h-8 w-8 text-primary" />
                    <h2 className="text-2xl font-bold">{activeItem.label}</h2>
                </div>
                {contentMap[activeView]}
            </div>
        );
    }

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4">
        <nav className="flex flex-row md:flex-col gap-2">
            {navItems.map(item => (
                <Button 
                    key={item.id}
                    variant={activeView === item.id ? 'secondary' : 'ghost'}
                    className="justify-start gap-3 w-full md:w-48"
                    onClick={() => setActiveView(item.id)}
                >
                    <item.icon className="h-5 w-5" />
                    <span className="hidden md:inline">{item.label}</span>
                </Button>
            ))}
        </nav>
        <div className="flex-1">
           {renderContent()}
        </div>
    </div>
  );
}
