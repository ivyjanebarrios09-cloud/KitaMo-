'use client';

import Link from 'next/link';
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentRoomDetails } from '@/components/student/room-details';
import { useDoc } from '@/firebase';
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

export default function StudentRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: room, loading: roomLoading } = useDoc<Room>(`rooms/${id}`);
  const { data: chairperson, loading: chairpersonLoading } = useDoc<User>(room ? `users/${room.chairpersonId}` : null);

  const loading = roomLoading || chairpersonLoading;

  if (loading) {
      return (
         <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
            <div className="mx-auto grid w-full max-w-6xl gap-2">
               <RoomHeaderSkeleton />
                <div className="mt-4">
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
      )
  }

  if (!room) {
    return (
       <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2 text-center">
            <h1 className="text-2xl font-bold">Room not found</h1>
            <p className="text-muted-foreground">This room may not exist or you may not have permission to view it.</p>
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
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <div className="flex items-center gap-4">
          <Link href="/student/rooms">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {room.name}
          </h1>
          <Badge variant="outline" className="ml-auto sm:ml-0">
            Managed by {chairperson?.name || '...'}
          </Badge>
        </div>
        <StudentRoomDetails room={room} roomId={id} />
      </div>
    </div>
  );
}
