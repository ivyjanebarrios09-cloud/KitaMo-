'use client';
import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Room } from '@/lib/types';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateRoomButton } from '@/components/chairperson/create-room-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, DollarSign, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function RoomCard({ room }: { room: Room }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{room.name}</CardTitle>
        <CardDescription>{room.description || 'No description provided.'}</CardDescription>
      </CardHeader>
       <CardFooter className="flex justify-between">
        <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>0 Students</span>
            </div>
            <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>$0.00</span>
            </div>
        </div>
        <Link href={`/chairperson/rooms/${room.id}`}>
            <Button variant="outline" size="sm">
                Manage Room
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
             <Skeleton className="mt-1 h-4 w-1/2" />
          </CardHeader>
          <CardFooter>
             <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function ChairpersonRoomsPage() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();

  const roomsQuery = useMemo(() => {
    if (!user) return null;
    // Query the 'rooms' subcollection under the current user.
    return query(collection(db, 'users', user.uid, 'rooms'));
  }, [db, user]);

  const { data: rooms, loading: roomsLoading, error } = useCollection<Room>(roomsQuery);

  const isLoading = userLoading || (roomsQuery && roomsLoading);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Rooms</h1>
          <p className="text-muted-foreground">
            Your financial rooms are listed below.
          </p>
        </div>
        <CreateRoomButton />
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

      {!isLoading && !rooms?.length && (
         <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No Rooms Yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Create your first financial room to get started.
            </p>
            <CreateRoomButton />
        </div>
      )}

      {!isLoading && rooms && rooms.length > 0 && (
        <div className="grid gap-6 md-grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
