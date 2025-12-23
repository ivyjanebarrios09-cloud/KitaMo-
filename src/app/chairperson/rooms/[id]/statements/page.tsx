'use client';

import React from 'react';
import { GenerateStatements } from '@/components/chairperson/generate-statements';
import { useDoc, useUser } from '@/firebase';
import type { Room } from '@/lib/types';
import { FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatementsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = React.use(params);
    const { user } = useUser();
    const { data: room, loading } = useDoc<Room>(user ? `users/${user.uid}/rooms/${roomId}` : null);


  return (
    <div>
        <div className="flex items-center gap-4 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Generate Statements</h1>
        </div>
        {loading && <Skeleton className="h-96 w-full" />}
        {room && <GenerateStatements room={room} roomId={roomId} />}
    </div>
  );
}
