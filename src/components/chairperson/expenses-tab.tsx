'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoc, collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Wallet, PiggyBank, PlusCircle, User } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import type { Expense, Payment, User as UserData } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Expense title is required.' }),
  description: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
  date: z.string().min(1, 'Date is required.'),
});

function AddExpenseForm({ roomId, chairpersonId }: { roomId: string, chairpersonId: string }) {
  const { toast } = useToast();
  const db = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      date: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const newExpense = {
      ...values,
      createdBy: chairpersonId,
    };

    try {
      await addDoc(collection(db, 'users', chairpersonId, 'rooms', roomId, 'expenses'), newExpense);
      toast({
        title: 'Success!',
        description: `The expense "${values.title}" has been added.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem adding your expense.',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post New Expense</CardTitle>
        <CardDescription>
          Record a new expense for this room.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Venue Rental" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category / Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Event Logistics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="3200.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
    const { data: user, loading } = useDoc<UserData>(payment.userId ? `users/${payment.userId}` : null);

    if (loading) {
        return (
             <TableRow>
                <TableCell colSpan={4}><Skeleton className="h-5 w-full" /></TableCell>
            </TableRow>
        )
    }
    return (
        <TableRow>
            <TableCell>{user?.name || 'Unknown Student'}</TableCell>
            <TableCell>{format(new Date(payment.date), 'PP')}</TableCell>
            <TableCell>{payment.note}</TableCell>
            <TableCell className="text-right">
                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(payment.amount)}
            </TableCell>
        </TableRow>
    )

}

function RecentPaymentsList({ roomId, chairpersonId }: { roomId: string, chairpersonId: string }) {
    const db = useFirestore();
    const paymentsQuery = useMemo(() => {
        if (!chairpersonId) return null;
        return query(collection(db, 'users', chairpersonId, 'rooms', roomId, 'payments'));
    }, [db, roomId, chairpersonId]);

    const { data: payments, loading } = useCollection<Payment>(paymentsQuery);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>A log of all payments received from students.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && <TableRow><TableCell colSpan={4} className="text-center">Loading payments...</TableCell></TableRow>}
                        {!loading && payments?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No payments recorded yet.</TableCell></TableRow>}
                        {payments?.map((payment) => (
                           <PaymentRow key={payment.id} payment={payment} />
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function FinancialSummaryCard({ title, value, icon, loading }: { title: string, value: number, icon: React.ReactNode, loading: boolean }) {
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
            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {loading ? 'Calculating...' : 'Updated in real-time'}
        </p>
      </CardContent>
    </Card>
  );
}


export function ExpensesTab({ roomId }: { roomId: string }) {
  const { user } = useUser();
  const db = useFirestore();

  const expensesQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'rooms', roomId, 'expenses'));
  }, [db, user, roomId]);

  const paymentsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'rooms', roomId, 'payments'));
  }, [db, user, roomId]);

  const { data: expenses, loading: expensesLoading } = useCollection<Expense>(expensesQuery);
  const { data: payments, loading: paymentsLoading } = useCollection<Payment>(paymentsQuery);

  const { totalExpenses, totalCollected, remainingBalance } = useMemo(() => {
    const expensesTotal = expenses?.reduce((sum, expense) => sum + expense.amount, 0) ?? 0;
    const paymentsTotal = payments?.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;
    return {
      totalExpenses: expensesTotal,
      totalCollected: paymentsTotal,
      remainingBalance: paymentsTotal - expensesTotal,
    };
  }, [expenses, payments]);

  const loading = expensesLoading || paymentsLoading;

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
         <FinancialSummaryCard 
            title="Total Collected Funds"
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
            title="Remaining Balance"
            value={remainingBalance}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AddExpenseForm roomId={roomId} chairpersonId={user.uid} />
        <RecentPaymentsList roomId={roomId} chairpersonId={user.uid} />
      </div>
    </div>
  );
}
