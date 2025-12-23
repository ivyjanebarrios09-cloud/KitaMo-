'use client';

import React from 'react';
import { useUser } from '@/firebase';
import { Megaphone } from 'lucide-react';
import { AnnouncementsFeed } from '@/components/chairperson/announcements-feed';

export default function AnnouncementsPage({ params }: { params: { id: string } }) {
  const { id: roomId } = params;
  const { user } = useUser();

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div>
        <div className="flex items-center gap-4 mb-4">
            <Megaphone className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Announcements</h1>
        </div>
        <AnnouncementsFeed 
            chairpersonId={user.uid}
            roomId={roomId}
            role="chairperson"
        />
    </div>
  );
}
