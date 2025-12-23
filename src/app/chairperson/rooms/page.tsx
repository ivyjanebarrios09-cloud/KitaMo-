
'use client';
import { useMemo, useState } from 'react';
import { collection, query, deleteDoc, doc, writeBatch, getDocs } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Room, RoomMember } from '@/lib/types';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { CreateRoomButton } from '@/components/chairperson/create-room-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Users, ArrowRight, ArrowLeft, MoreHorizontal, Archive, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

function RoomCard({ room }: { room: Room }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);


  const membersQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, `users/${user.uid}/rooms/${room.id}/members`));
  }, [db, user, room.id]);

  const { data: members, loading: membersLoading } = useCollection<RoomMember>(membersQuery);

  const handleArchive = async () => {
    if (!user) return;
    setIsDeleting(true);

    try {
      // This is a simplified "archive" that deletes the room and its code reference.
      // A full archive implementation would involve setting an "archived" flag.
      const batch = writeBatch(db);
      
      const roomRef = doc(db, 'users', user.uid, 'rooms', room.id);
      batch.delete(roomRef);

      const roomCodeRef = doc(db, 'roomCodes', room.code);
      batch.delete(roomCodeRef);
      
      await batch.commit();

      toast({
        title: 'Room Archived',
        description: `"${room.name}" has been archived.`,
      });
    } catch (error) {
      console.error('Error archiving room:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not archive the room. Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };


  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>{room.name}</CardTitle>
        <CardDescription>{room.description || 'No description provided.'}</CardDescription>
      </CardHeader>
       <CardFooter className="flex justify-between items-center">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {membersLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <span>{members?.length || 0} Students</span>
                )}
            </div>
            <div className="flex items-center gap-1">
                <span>₱0.00</span>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Link href={`/chairperson/rooms/${room.id}`}>
                <Button variant="outline" size="sm">
                    Manage Room
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDeleteAlert(true)} className="text-destructive">
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
     <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this room?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room and all its associated data. Students will no longer be able to access it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
              Archive
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Link href="/chairperson/dashboard">
            <Button variant="outline" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            </Link>
            <div>
            <h1 className="text-3xl font-bold">Manage Rooms</h1>
            <p className="text-muted-foreground">
                Your financial rooms are listed below.
            </p>
            </div>
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
