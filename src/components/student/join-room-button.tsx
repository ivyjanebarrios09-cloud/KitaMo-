'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  code: z
    .string()
    .min(1, { message: 'Join code is required.' })
    .length(6, { message: 'Code must be 6 characters.' }),
});

export function JoinRoomButton() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to join a room.',
      });
      return;
    }

    try {
      // 1. Look up the room by the join code
      const roomCodeRef = doc(db, 'roomCodes', values.code.toUpperCase());
      const roomCodeSnap = await getDoc(roomCodeRef);

      if (!roomCodeSnap.exists()) {
        toast({
          variant: 'destructive',
          title: 'Invalid Code',
          description: 'No room found with that code. Please check and try again.',
        });
        return;
      }

      const { chairpersonId, roomId } = roomCodeSnap.data();

      // 2. Get the room details to show the name in the toast
      const roomRef = doc(db, 'users', chairpersonId, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      const roomName = roomSnap.exists() ? roomSnap.data().name : 'the room';
      
      // 3. Add the student to the room's members subcollection
      const memberRef = doc(db, 'users', chairpersonId, 'rooms', roomId, 'members', user.uid);
      const memberSnap = await getDoc(memberRef);

      if (memberSnap.exists()) {
        toast({
          title: 'Already a Member',
          description: `You are already a member of "${roomName}".`,
        });
        setOpen(false);
        form.reset();
        return;
      }

      const newMemberData = {
        userId: user.uid,
        role: 'student',
        joinedAt: serverTimestamp(),
      };

      const batch = writeBatch(db);
      batch.set(memberRef, newMemberData);

      // Create a reference in the student's user doc to easily find all rooms they are a member of.
      const studentRoomRef = doc(db, 'users', user.uid, 'joinedRooms', roomId);
      batch.set(studentRoomRef, { 
        roomId, 
        chairpersonId,
        roomName: roomName,
        roomDescription: roomSnap.exists() ? roomSnap.data().description : '',
        joinedAt: serverTimestamp(),
      });

      await batch.commit();

      toast({
        title: 'Success!',
        description: `You have successfully joined: "${roomName}".`,
      });
      setOpen(false);
      form.reset();

    } catch (error: any) {
      if (error.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: 'roomMembers or roomCodes or joinedRooms', // This could fail on read or write
          operation: 'create',
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        console.error('Error joining room:', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem joining the room.',
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Join Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Join a Financial Room</DialogTitle>
              <DialogDescription>
                Enter the unique join code provided by your financial chairperson.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Join Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABCDEF"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Joining...' : 'Join Room'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
