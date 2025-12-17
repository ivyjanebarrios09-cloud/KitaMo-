'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useUser as useAuthUser, useDoc } from '@/firebase';
import type { RoomMember, User as UserData } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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

function StudentRow({ member }: { member: RoomMember }) {
  const { data: user, loading } = useDoc<UserData>(`users/${member.userId}`);
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'avatar2'); // Just an example avatar

  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={5}>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (!user) {
    return (
        <TableRow>
            <TableCell colSpan={5}>User data could not be loaded for member ID: {member.userId}</TableCell>
        </TableRow>
    )
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-4">
          <Avatar className="hidden h-9 w-9 sm:flex">
             {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Avatar" />}
            <AvatarFallback>{user.name?.charAt(0) || 'S'}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </TableCell>
       <TableCell>
        {member.joinedAt ? format(member.joinedAt.toDate(), 'PP') : 'N/A'}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-green-600 border-green-600/50">Paid</Badge>
      </TableCell>
      <TableCell className="text-right font-medium">₱0.00</TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="outline" disabled>
            Mark as Paid
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function StudentsTab({ roomId, chairpersonId }: { roomId: string; chairpersonId: string }) {
  const db = useFirestore();

  const membersQuery = useMemo(() => {
    if (!chairpersonId || !roomId) return null;
    return query(collection(db, `users/${chairpersonId}/rooms/${roomId}/members`));
  }, [db, chairpersonId, roomId]);

  const { data: members, loading } = useCollection<RoomMember>(membersQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Students</CardTitle>
        <CardDescription>
            A list of all students who have joined this room.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead>Overall Status</TableHead>
              <TableHead className="text-right">Total Owed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading members...</TableCell>
                </TableRow>
            )}
            {!loading && members?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No students have joined this room yet.
                </TableCell>
              </TableRow>
            )}
            {!loading && members?.map((member) => (
              <StudentRow key={member.id} member={member} />
            ))}
          </TableBody>
        </Table>
         <p className="text-sm text-muted-foreground text-center pt-4">Payment tracking is coming soon.</p>
      </CardContent>
    </Card>
  );
}
