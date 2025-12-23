'use client';

import React, { useMemo } from 'react';
import { collection, query, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Expense, FundDeadline, RoomMember } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HandCoins, Landmark, Heart, Users, Megaphone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Post = (Expense & { type: 'expense' }) | (FundDeadline & { type: 'deadline' });
type SeenRecord = { id: string, userId: string };

function PostCard({ post, chairpersonId, roomId, role }: { post: Post; chairpersonId: string; roomId: string; role: 'chairperson' | 'student' }) {
    const db = useFirestore();
    const { user } = useUser();
    
    const postType = 'dueDate' in post ? 'deadline' : 'expense';
    const postDate = 'dueDate' in post ? post.dueDate : post.date;

    const seenByQuery = useMemo(() => {
        return query(collection(db, `users/${chairpersonId}/rooms/${roomId}/${postType}s/${post.id}/seenBy`));
    }, [db, chairpersonId, roomId, postType, post.id]);

    const { data: seenBy, loading: seenByLoading } = useCollection<SeenRecord>(seenByQuery);
    
    const hasSeen = useMemo(() => {
        if (!user || !seenBy) return false;
        return seenBy.some(record => record.userId === user.uid);
    }, [seenBy, user]);

    const handleMarkAsSeen = async () => {
        if (!user || hasSeen) return;

        const seenRef = doc(db, `users/${chairpersonId}/rooms/${roomId}/${postType}s/${post.id}/seenBy`, user.uid);
        await setDoc(seenRef, {
            userId: user.uid,
            seenAt: serverTimestamp(),
        });
    };
    
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${post.type === 'deadline' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-red-100 dark:bg-red-900'}`}>
                            {post.type === 'deadline' ? <HandCoins className="h-6 w-6 text-blue-600 dark:text-blue-400" /> : <Landmark className="h-6 w-6 text-red-600 dark:text-red-400" />}
                        </div>
                        <div>
                            <CardTitle>{post.title}</CardTitle>
                            <CardDescription>
                                {post.type === 'deadline' ? 'New Fund Deadline' : 'New Expense Posted'} - {format(new Date(postDate), 'PPP')}
                            </CardDescription>
                        </div>
                    </div>
                     <Badge variant={post.type === 'deadline' ? 'secondary' : 'outline'}>{post.type}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                    {post.type === 'deadline' ? post.category : post.description}
                </p>
                 <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(post.type === 'deadline' ? post.amountPerStudent : post.amount)}
                    {post.type === 'deadline' && <span className="text-sm font-normal text-muted-foreground"> per student</span>}
                </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                 {role === 'student' && (
                    <Button onClick={handleMarkAsSeen} disabled={hasSeen || seenByLoading}>
                        <Heart className={`mr-2 h-4 w-4 ${hasSeen ? 'fill-pink-500 text-pink-500' : ''}`} />
                        {seenByLoading ? '...' : (hasSeen ? 'Seen' : 'Mark as Seen')}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}


interface AnnouncementsFeedProps {
    chairpersonId: string;
    roomId: string;
    studentId: string;
    role: 'student';
}

export function AnnouncementsFeed({ chairpersonId, roomId, role }: AnnouncementsFeedProps) {
  const db = useFirestore();

  const expensesQuery = useMemo(() => {
    return query(collection(db, `users/${chairpersonId}/rooms/${roomId}/expenses`));
  }, [db, chairpersonId, roomId]);

  const deadlinesQuery = useMemo(() => {
    return query(collection(db, `users/${chairpersonId}/rooms/${roomId}/deadlines`));
  }, [db, chairpersonId, roomId]);

  const { data: expenses, loading: expensesLoading } = useCollection<Expense>(expensesQuery);
  const { data: deadlines, loading: deadlinesLoading } = useCollection<FundDeadline>(deadlinesQuery);

  const combinedFeed = useMemo(() => {
    if (!expenses || !deadlines) return null;

    const allPosts: Post[] = [
      ...expenses.map(e => ({ ...e, type: 'expense' as const })),
      ...deadlines.map(d => ({ ...d, type: 'deadline' as const })),
    ];

    allPosts.sort((a, b) => {
      const dateA = new Date('date' in a ? a.date : a.dueDate);
      const dateB = new Date('date' in b ? b.date : b.dueDate);
      return dateB.getTime() - dateA.getTime();
    });

    return allPosts;
  }, [expenses, deadlines]);
  
  const loading = expensesLoading || deadlinesLoading;

  if (loading) {
      return (
          <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
          </div>
      )
  }

  if (!combinedFeed || combinedFeed.length === 0) {
      return (
          <div className="text-center py-12">
              <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Announcements Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                  When new expenses or deadlines are posted, they will appear here.
              </p>
          </div>
      )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
        {combinedFeed.map(post => (
            <PostCard key={`${post.type}-${post.id}`} post={post} chairpersonId={chairpersonId} roomId={roomId} role={role} />
        ))}
    </div>
  );
}
