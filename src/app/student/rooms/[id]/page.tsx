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
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

function RoomHeaderSkeleton() {
    return (
        <div className="flex items-center gap-4">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="ml-auto h-6 w-32" />
        </div>
    )
}

// This page has a fundamental issue: to view a room, we need to know the chairperson's ID.
// The room ID alone is not enough with the new nested structure.
// This will require a larger refactor to how students access rooms.
// For now, it will likely fail to load data correctly.
export default function StudentRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const db = useFirestore();
  const [room, setRoom] = React.useState<Room | null>(null);
  const [chairperson, setChairperson] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // This is not a scalable way to find a room.
    // It requires knowing the chairpersonId ahead of time.
    // This is a placeholder to demonstrate the structural issue.
    // A real app would likely get the chairpersonId from the room listing page
    // or from a 'joinedRooms' subcollection on the student's user doc.
    console.error("This page needs a way to find the chairperson's ID for the given room ID.");
    setLoading(false);
  }, [id, db]);


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
            <p className="text-muted-foreground">This room may not exist, or we could not determine its owner. This page requires fixing to work with the new data structure.</p>
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
