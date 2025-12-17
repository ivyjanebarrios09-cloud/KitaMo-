'use client';

import { JoinRoomButton } from '@/components/student/join-room-button';
import { FileText } from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import type { Room } from '@/lib/types';
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

function RoomCard({ room }: { room: Room }) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{room.name}</CardTitle>
          <CardDescription>{room.description || 'No description provided.'}</CardDescription>
        </CardHeader>
         <CardFooter className="flex justify-between">
          <div></div>
          <Link href={`/student/rooms/${room.id}`}>
              <Button variant="outline" size="sm">
                  View Room
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

export default function StudentRoomsPage() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();

  // This query is a placeholder. A real implementation would require a more complex query
  // or a different data structure to efficiently find all rooms a user is a member of.
  // For example, storing a list of joined room IDs in the user's document.
  const roomsQuery = useMemo(() => {
    if (!user) return null;
    // This is not a valid firestore query. We cannot query subcollections across all users.
    // This will be fixed later.
    return query(collection(db, 'rooms'), where('memberIds', 'array-contains', user.uid));
  }, [db, user]);

  const { data: rooms, loading: roomsLoading } = useCollection<Room>(roomsQuery);

  const isLoading = userLoading || (roomsQuery && roomsLoading);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Rooms</h1>
          <p className="text-muted-foreground">
            The rooms you have joined are listed below.
          </p>
        </div>
        <JoinRoomButton />
      </div>

      {/* This section will be replaced with a list of joined rooms later. */}
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">No Rooms Joined Yet</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Join your first financial room to see its details here. <br/>
          (Room listing is not yet implemented).
        </p>
        <JoinRoomButton />
      </div>
    </div>
  );
}
