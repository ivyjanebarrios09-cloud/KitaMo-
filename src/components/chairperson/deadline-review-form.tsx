'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
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

export function DeadlineReviewForm() {
  const [deadlineText, setDeadlineText] = useState('');
  const [reviewedText, setReviewedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReview = async () => {
    if (!deadlineText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to review.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setReviewedText('');
    try {
      const result = await reviewFundDeadline({ deadlineText });
      setReviewedText(result.reviewedText);
    } catch (error) {
      console.error('Failed to review deadline text:', error);
      toast({
        title: 'Review Failed',
        description: 'Could not get a review from the AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Post a New Fund Deadline</CardTitle>
        <CardDescription>
          Create a deadline and use our AI tool to refine your message.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Deadline Title</Label>
            <Input id="title" placeholder="e.g., Spring Formal Tickets" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount per Student ($)</Label>
            <Input id="amount" type="number" placeholder="50.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Input id="due-date" type="date" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="billing-period">Billing Period</Label>
            <Input id="billing-period" placeholder="e.g., April 2024" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description / Announcement</Label>
          <Textarea
            id="description"
            placeholder="Write your announcement here. Example: 'Final reminder: formal tickets must be purchased by Friday!'"
            value={deadlineText}
            onChange={(e) => setDeadlineText(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
        <div>
          <Button onClick={handleReview} disabled={isLoading}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isLoading ? 'Reviewing...' : 'Review with AI'}
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reviewed-description">AI-Suggested Text</Label>
          {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <Textarea
              id="reviewed-description"
              placeholder="AI suggestions will appear here..."
              value={reviewedText}
              readOnly
              className="min-h-[120px] bg-muted/50"
            />
          )}
        </div>
        <div className="flex justify-end">
            <Button>Post Deadline</Button>
        </div>
      </CardContent>
    </Card>
  );
}
