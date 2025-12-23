
'use client';

import { JoinRoomButton } from '@/components/student/join-room-button';
import { ArrowLeft, ArrowRight, FileText, MoreHorizontal, LogOut, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useMemo, useState } from 'react';
import { collection, query, doc, writeBatch } from 'firebase/firestore';
import type { JoinedRoom, User as UserData } from '@/lib/types';
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function RoomCard({ room }: { room: JoinedRoom }) {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const [isLeaving, setIsLeaving] = useState(false);
    const [showLeaveAlert, setShowLeaveAlert] = useState(false);

    const handleLeaveRoom = async () => {
        if (!user) return;
        setIsLeaving(true);

        try {
            const batch = writeBatch(db);

            // Remove student from the room's members subcollection
            const memberRef = doc(db, 'users', room.chairpersonId, 'rooms', room.roomId, 'members', user.uid);
            batch.delete(memberRef);

            // Remove room reference from the student's joinedRooms subcollection
            const studentRoomRef = doc(db, 'users', user.uid, 'joinedRooms', room.roomId);
            batch.delete(studentRoomRef);

            await batch.commit();

            toast({
                title: 'You have left the room',
                description: `You are no longer a member of "${room.roomName}".`,
            });
        } catch (error) {
            console.error('Error leaving room:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not leave the room. Please try again.',
            });
        } finally {
            setIsLeaving(false);
            setShowLeaveAlert(false);
        }
    };

    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>{room.roomName}</CardTitle>
            <CardDescription>{room.roomDescription || 'No description provided.'}</CardDescription>
            <div className="text-sm text-muted-foreground pt-2">
                Created by:{' '}
                <span className="font-medium text-foreground">{room.chairpersonName || 'Unknown'}</span>
            </div>
          </CardHeader>
          <CardContent>
              {/* Content can be used for other stats in the future */}
          </CardContent>
           <CardFooter className="flex justify-between items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowLeaveAlert(true)} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave Room
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href={`/student/rooms/${room.roomId}?chairpersonId=${room.chairpersonId}`}>
                <Button variant="outline" size="sm">
                    View Room
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </CardFooter>
        </Card>
        <AlertDialog open={showLeaveAlert} onOpenChange={setShowLeaveAlert}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to leave this room?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You will lose access to all financial data for this room and will need to be re-invited or use the join code again.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleLeaveRoom}
                        disabled={isLeaving}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isLeaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                        Leave Room
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </>
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
          <CardContent>
             {/* Adding empty content to match layout */}
          </CardContent>
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
            <Button variant="outline" size="icon" className="h-10 w-10">
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
