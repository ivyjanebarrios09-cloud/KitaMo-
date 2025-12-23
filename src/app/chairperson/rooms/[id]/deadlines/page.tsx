'use client';
import React from 'react';
import { DeadlineReviewForm } from '@/components/chairperson/deadline-review-form';
import { CalendarCheck } from 'lucide-react';

export default function DeadlinesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return (
    <div>
        <div className="flex items-center gap-4 mb-4">
            <CalendarCheck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Fund Deadlines</h1>
        </div>
        <DeadlineReviewForm roomId={id} />
    </div>
  );
}
