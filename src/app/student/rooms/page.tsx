'use client';

import { JoinRoomButton } from '@/components/student/join-room-button';
import { FileText } from 'lucide-react';

export default function StudentRoomsPage() {
  // In the future, this page will list the rooms the student has joined.
  // For now, it provides a way to join a new room.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Rooms</h1>
          <p className="text-muted-foreground">
            The rooms you have joined are listed below.
          </p>
        </div>
        <JoinRoomButton />
      </div>

      {/* This section will be replaced with a list of joined rooms later. */}
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/50 p-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">No Rooms Joined Yet</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          Join your first financial room to see its details here.
        </p>
        <JoinRoomButton />
      </div>
    </div>
  );
}
