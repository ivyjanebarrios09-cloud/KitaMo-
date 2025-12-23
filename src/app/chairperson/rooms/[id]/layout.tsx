'use client';

import Link from 'next/link';
import React from 'react';
import { useDoc, useUser } from '@/firebase';
import type { Room } from '@/lib/types';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function RoomHeaderSkeleton() {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="ml-auto h-6 w-32" />
        </div>
    )
}

export default function ChairpersonRoomLayout({ 
    children,
    params 
}: { 
    children: React.ReactNode,
    params: Promise<{ id: string }> 
}) {
  const { id } = React.use(params);
  const { user, loading: userLoading } = useUser();
  const { data: room, loading: roomLoading } = useDoc<Room>(user ? `users/${user.uid}/rooms/${id}` : null);

  const loading = userLoading || roomLoading;

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 md:gap-8">
      <div className="mx-auto grid w-full max-w-6xl gap-2 px-4 sm:px-0">
        {loading ? <RoomHeaderSkeleton /> : (
            room ? (
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <Link href="/chairperson/rooms" className="hidden sm:block">
                        <Button variant="outline" size="icon" className="h-7 w-7">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                        </Button>
                    </Link>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        {room.name}
                    </h1>
                    <Badge variant="outline" className="ml-auto sm:ml-0 font-mono">
                        CODE: {room.code}
                    </Badge>
                </div>
            ) : (
                 <div className="text-center">
                    <h1 className="text-2xl font-bold">Room not found</h1>
                    <p className="text-muted-foreground">This room may have been deleted or you may not have permission to view it.</p>
                    <div className="mt-4">
                        <Link href="/chairperson/rooms">
                            <Button variant="outline">Go back to Rooms</Button>
                        </Link>
                    </div>
                </div>
            )
        )}
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 px-4 sm:px-0">
        {loading && <Skeleton className="h-96 w-full" />}
        {!loading && room && children}
      </div>
    </div>
  );
}
