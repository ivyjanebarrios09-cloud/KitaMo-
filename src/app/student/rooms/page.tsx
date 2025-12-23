
'use client';

import { JoinRoomButton } from '@/components/student/join-room-button';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import type { JoinedRoom, User as UserData } from '@/lib/types';
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

function RoomCard({ room }: { room: JoinedRoom }) {
    const { data: chairperson, loading } = useDoc<UserData>(room.chairpersonId ? `users/${room.chairpersonId}` : null);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{room.roomName}</CardTitle>
          <CardDescription>{room.roomDescription || 'No description provided.'}</CardDescription>
          <CardDescription className="pt-2">
            Created by: {' '}
            {loading ? (
              <Skeleton className="h-4 w-32 inline-block" />
            ) : (
              <span>{chairperson?.name || '...'}</span>
            )}
          </CardDescription>
        </CardHeader>
         <CardFooter className="flex justify-end">
          <Link href={`/student/rooms/${room.roomId}?chairpersonId=${room.chairpersonId}`}>
              <Button variant="outline" size="sm">
                  View Room
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

function RoomsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </CardHeader>
          <CardFooter className="flex justify-end">
             <Skeleton className="h-9 w-28" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}


export default function StudentRoomsPage() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();

  const joinedRoomsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'users', user.uid, 'joinedRooms'));
  }, [db, user]);

  const { data: joinedRooms, loading: roomsLoading, error } = useCollection<JoinedRoom>(joinedRoomsQuery);

  const isLoading = userLoading || (joinedRoomsQuery && roomsLoading);

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Link href="/student/dashboard">
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            </Link>
            <div>
            <h1 className="text-3xl font-bold">My Rooms</h1>
            <p className="text-muted-foreground">
                The rooms you have joined are listed below.
            </p>
            </div>
        </div>
        <JoinRoomButton />
      </div>

      {isLoading && <RoomsSkeleton />}

      {!isLoading && error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was a problem loading your rooms. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !joinedRooms?.length && (
         <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No Rooms Joined Yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Click the "Join Room" button to join your first financial room.
            </p>
            <JoinRoomButton />
        </div>
      )}

      {!isLoading && joinedRooms && joinedRooms.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {joinedRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
