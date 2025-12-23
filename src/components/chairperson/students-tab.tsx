'use client';

import React, { useMemo, useState } from 'react';
import { collection, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import type { RoomMember, User as UserData, FundDeadline, Payment } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { DollarSign, CheckCircle } from 'lucide-react';

function StudentDeadlines({
  chairpersonId,
  roomId,
  studentId,
  deadlines,
  payments,
}: {
  chairpersonId: string;
  roomId: string;
  studentId: string;
  deadlines: FundDeadline[];
  payments: Payment[];
}) {
  const db = useFirestore();
  const { toast } = useToast();
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null);

  const handleRecordPayment = async (deadline: FundDeadline) => {
    setLoadingPayment(deadline.id);
    const newPayment = {
      userId: studentId,
      amount: deadline.amountPerStudent,
      date: new Date().toISOString(),
      note: `Payment for ${deadline.title}`,
      deadlineId: deadline.id,
    };

    try {
      const paymentRef = collection(db, 'users', chairpersonId, 'rooms', roomId, 'payments');
      await addDoc(paymentRef, newPayment);
      toast({
        title: 'Payment Recorded',
        description: `Payment for ${deadline.title} has been recorded.`,
      });
    } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `users/${chairpersonId}/rooms/${roomId}/payments`,
                operation: 'create',
                requestResourceData: newPayment,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to record payment.',
             });
        }
      console.error('Error recording payment:', error);
    } finally {
        setLoadingPayment(null);
    }
  };

  if (!deadlines || deadlines.length === 0) {
    return (
      <p className="px-4 py-2 text-sm text-muted-foreground">
        No deadlines have been posted for this room yet.
      </p>
    );
  }

  return (
    <div className="px-1 sm:px-4 pb-4 overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {deadlines.map((deadline) => {
                    const hasPaid = payments.some(p => p.deadlineId === deadline.id);
                    return (
                        <TableRow key={deadline.id}>
                            <TableCell>{deadline.title}</TableCell>
                            <TableCell>₱{deadline.amountPerStudent.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={hasPaid ? 'secondary' : 'destructive'}>
                                {hasPaid ? 'Paid' : 'Unpaid'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {hasPaid ? (
                                    <div className="flex items-center justify-end gap-2 text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Paid</span>
                                    </div>
                                ) : (
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleRecordPayment(deadline)}
                                        disabled={loadingPayment === deadline.id}
                                    >
                                        {loadingPayment === deadline.id ? '...' : 'Record Pmt.'}
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    </div>
  );
}

function StudentRow({
  member,
  chairpersonId,
  roomId,
  deadlines,
  payments,
}: {
  member: RoomMember;
  chairpersonId: string;
  roomId: string;
  deadlines: FundDeadline[];
  payments: Payment[];
}) {
  const { data: user, loading } = useDoc<UserData>(`users/${member.userId}`);
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'avatar2');
  
  const studentPayments = useMemo(() => {
      return payments.filter(p => p.userId === member.userId);
  }, [payments, member.userId]);
  
  const totalDue = useMemo(() => {
      return deadlines.reduce((acc, d) => acc + d.amountPerStudent, 0);
  }, [deadlines]);

  const totalPaid = useMemo(() => {
      return studentPayments.reduce((acc, p) => acc + p.amount, 0);
  }, [studentPayments]);

  const allDeadlinesPaid = useMemo(() => {
      if (deadlines.length === 0) return true;
      return deadlines.every(d => studentPayments.some(p => p.deadlineId === d.id));
  }, [deadlines, studentPayments]);


  if (loading) {
    return (
      <AccordionItem value={member.id} disabled>
        <AccordionTrigger>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1 text-left">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </AccordionTrigger>
      </AccordionItem>
    );
  }

  if (!user) {
    return null; // Or some error state
  }

  return (
    <AccordionItem value={user.id}>
      <AccordionTrigger>
        <div className="flex w-full items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Avatar" />}
              <AvatarFallback>{user.name?.charAt(0) || 'S'}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1 text-left">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-none">{user.email}</p>
            </div>
          </div>
          <div className="flex-1" />
           <div className="hidden sm:flex items-center gap-6 pr-4">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={allDeadlinesPaid ? 'secondary' : 'destructive'}>
                        {allDeadlinesPaid ? 'Fully Paid' : 'Pending'}
                    </Badge>
                </div>
                 <div className="text-center">
                    <p className="text-sm text-muted-foreground">Paid</p>
                     <p className="font-medium">₱{totalPaid.toFixed(2)}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Owed</p>
                    <p className="font-medium">₱{(totalDue - totalPaid).toFixed(2)}</p>
                </div>
           </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <StudentDeadlines
          chairpersonId={chairpersonId}
          roomId={roomId}
          studentId={user.id}
          deadlines={deadlines}
          payments={studentPayments}
        />
      </AccordionContent>
    </AccordionItem>
  );
}

export function StudentsTab({
  roomId,
  chairpersonId,
}: {
  roomId: string;
  chairpersonId: string;
}) {
  const db = useFirestore();

  const membersQuery = useMemo(() => {
    return query(
      collection(db, `users/${chairpersonId}/rooms/${roomId}/members`)
    );
  }, [db, chairpersonId, roomId]);

  const deadlinesQuery = useMemo(() => {
    return query(
      collection(db, `users/${chairpersonId}/rooms/${roomId}/deadlines`)
    );
  }, [db, chairpersonId, roomId]);
  
  const paymentsQuery = useMemo(() => {
    return query(
      collection(db, `users/${chairpersonId}/rooms/${roomId}/payments`)
    );
  }, [db, chairpersonId, roomId]);

  const { data: members, loading: membersLoading } = useCollection<RoomMember>(membersQuery);
  const { data: deadlines, loading: deadlinesLoading } = useCollection<FundDeadline>(deadlinesQuery);
  const { data: payments, loading: paymentsLoading } = useCollection<Payment>(paymentsQuery);
  
  const loading = membersLoading || deadlinesLoading || paymentsLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Students</CardTitle>
        <CardDescription>
          A list of all students who have joined this room. Click on a student to view and manage their payment status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-center text-muted-foreground">Loading student data...</p>}
        
        {!loading && (!members || members.length === 0) && (
            <p className="text-center text-muted-foreground py-8">
                No students have joined this room yet.
            </p>
        )}

        {!loading && members && members.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            {members.map((member) => (
              <StudentRow
                key={member.id}
                member={member}
                chairpersonId={chairpersonId}
                roomId={roomId}
                deadlines={deadlines || []}
                payments={payments || []}
              />
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
