'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wand2 } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { reviewFundDeadline } from '@/ai/flows/fund-deadline-review';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  amountPerStudent: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
  dueDate: z.string().min(1, 'Due date is required.'),
  month: z.string().min(1, 'Billing month is required.'),
  announcement: z.string().optional(),
});

export function DeadlineReviewForm({ roomId }: { roomId: string }) {
  const [reviewedText, setReviewedText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amountPerStudent: 0,
      dueDate: '',
      month: '',
      announcement: '',
    },
  });

  const announcementText = form.watch('announcement');

  const handleReview = async () => {
    if (!announcementText?.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to review.',
        variant: 'destructive',
      });
      return;
    }

    setIsAiLoading(true);
    setReviewedText('');
    try {
      const result = await reviewFundDeadline({ deadlineText: announcementText });
      setReviewedText(result.reviewedText);
      toast({
        title: 'Review Complete',
        description: 'The AI has provided a suggestion below.',
      });
    } catch (error) {
      console.error('Failed to review deadline text:', error);
      toast({
        title: 'Review Failed',
        description: 'Could not get a review from the AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
        toast({ variant: "destructive", title: "Not authenticated" });
        return;
    }
    try {
      const deadlineData = {
        ...values,
        announcement: reviewedText || values.announcement,
      };
      await addDoc(collection(db, 'users', user.uid, 'rooms', roomId, 'deadlines'), deadlineData);
      toast({
        title: 'Success!',
        description: 'The new fund deadline has been posted.',
      });
      form.reset();
      setReviewedText('');
    } catch (error) {
      console.error('Error posting deadline:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem posting the deadline.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post a New Fund Deadline</CardTitle>
        <CardDescription>
          Create a deadline and use our AI tool to refine your message for students.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <Label>Deadline Title</Label>
                    <FormControl>
                      <Input placeholder="e.g., Spring Formal Tickets" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amountPerStudent"
                render={({ field }) => (
                  <FormItem>
                    <Label>Amount per Student ($)</Label>
                    <FormControl>
                      <Input type="number" placeholder="50.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <Label>Due Date</Label>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <Label>Billing Period</Label>
                    <FormControl>
                      <Input placeholder="e.g., April 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="announcement"
                render={({ field }) => (
                  <FormItem>
                    <Label>Description / Announcement</Label>
                    <FormControl>
                      <Textarea
                        placeholder="Write your announcement here. Example: 'Final reminder: formal tickets must be purchased by Friday!'"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Button type="button" onClick={handleReview} disabled={isAiLoading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isAiLoading ? 'Reviewing...' : 'Review with AI'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>AI-Suggested Text</Label>
              {isAiLoading ? (
                <div className="space-y-2 rounded-md border border-input bg-muted/50 p-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <Textarea
                  placeholder="AI suggestions will appear here..."
                  value={reviewedText}
                  readOnly={!reviewedText}
                  onChange={(e) => setReviewedText(e.target.value)}
                  className="min-h-[120px] bg-muted/50"
                />
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Posting...' : 'Post Deadline'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
