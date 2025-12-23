
'use client';

import Link from 'next/link';
import React, { Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { ChevronLeft, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentRoomDetails } from '@/components/student/room-details';
import { useDoc, useUser as useAuthUser } from '@/firebase';
import type { Room, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function RoomHeaderSkeleton() {
    return (
        <div className="flex items-center gap-4">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="ml-auto h-6 w-32" />
        </div>
    )
}

function StudentRoomPageContent() {
  const params = useParams() as { id: string };
  const roomId = params.id;
  const searchParams = useSearchParams();
  const chairpersonId = searchParams.get('chairpersonId');
  const activeView = (searchParams.get('view') as any) || 'dashboard';
  
  const { user: studentUser, loading: studentLoading } = useAuthUser();

  const { data: room, loading: roomLoading } = useDoc<Room>(
    chairpersonId ? `users/${chairpersonId}/rooms/${roomId}` : null
  );

  const { data: chairperson, loading: chairpersonLoading } = useDoc<User>(
    chairpersonId ? `users/${chairpersonId}` : null
  );

  const loading = roomLoading || chairpersonLoading || studentLoading;

  if (loading) {
      return (
         <div className="flex min-h-full flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
            <div className="mx-auto grid w-full max-w-6xl gap-2">
               <RoomHeaderSkeleton />
                <div className="mt-4">
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
      )
  }

  if (!room || !chairpersonId) {
    return (
       <div className="flex min-h-full flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2 text-center">
            <h1 className="text-2xl font-bold">Room not found</h1>
            <p className="text-muted-foreground">This room may not exist or the link is incomplete. Please ensure you have the correct link from the 'My Rooms' page.</p>
             <div className="mt-4">
                 <Link href="/student/rooms">
                    <Button variant="outline">Go back to My Rooms</Button>
                </Link>
             </div>
        </div>
      </div>
    )
  }


  return (
    <div className="flex min-h-full flex-1 flex-col gap-4 bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 px-4">
        <div className="flex items-center gap-4 pt-4">
            <Link href="/student/rooms">
              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
             <h1 className="flex-1 whitespace-nowrap text-xl font-semibold tracking-tight">
                {room.name}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                    by {chairperson?.name || '...'}
                </span>
            </h1>
        </div>
        {studentUser && <StudentRoomDetails room={room} roomId={roomId} chairpersonId={chairpersonId} studentId={studentUser.uid} activeView={activeView} />}
      </div>
    </div>
  );
}

export default function StudentRoomPage() {
  return (
    <Suspense fallback={<RoomHeaderSkeleton />}>
      <StudentRoomPageContent />
    </Suspense>
  );
}
