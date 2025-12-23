
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
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
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Label } from '../ui/label';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Room name is required.' }),
  description: z.string().optional(),
});

function generateJoinCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}


export function CreateRoomButton() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a room.',
      });
      return;
    }

    const newRoomData = {
      name: values.name,
      description: values.description || '',
      code: generateJoinCode(),
      createdAt: serverTimestamp(),
    };

    try {
        const batch = writeBatch(db);

        // Reference to the new room document in the user's subcollection
        const roomRef = doc(collection(db, 'users', user.uid, 'rooms'));

        // Set the room data
        batch.set(roomRef, newRoomData);

        // Reference to the room lookup document
        const roomCodeRef = doc(db, 'roomCodes', newRoomData.code);
        
        // Set the lookup data. Note: This will be disallowed by security rules for clients.
        // This should ideally be handled by a Cloud Function for security and consistency.
        // For now, we attempt it and let it fail silently on the client if rules are enforced.
        batch.set(roomCodeRef, {
            roomId: roomRef.id,
            chairpersonId: user.uid,
        });

        await batch.commit();

        toast({
          title: 'Success!',
          description: `The room "${values.name}" has been created.`,
        });
        form.reset();
        setOpen(false);
      } catch(error: any) {
         if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: `users/${user.uid}/rooms`,
              operation: 'create',
              requestResourceData: newRoomData,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error('Error creating room:', error);
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: 'There was a problem creating your room. Note: Room code mapping might fail due to security rules if not using a Cloud Function.',
            });
        }
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create a New Financial Room</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new room for your group.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fall Semester Dues" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description of this room's purpose."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label>Created By</Label>
                <Input
                  disabled
                  value={user?.displayName || 'Loading...'}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Room'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
