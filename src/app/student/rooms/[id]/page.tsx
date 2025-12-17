import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentRoomDetails } from '@/components/student/room-details';

export default function StudentRoomPage({ params }: { params: { id: string } }) {
  const room = {
    id: params.id,
    name: 'Fall 2024 Engineering Ball',
    chairperson: 'Dr. Evelyn Reed',
  };

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl gap-2">
        <div className="flex items-center gap-4">
          <Link href="/student/dashboard">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {room.name}
          </h1>
          <Badge variant="outline" className="ml-auto sm:ml-0">
            Managed by {room.chairperson}
          </Badge>
        </div>
        <StudentRoomDetails />
      </div>
    </div>
  );
}
