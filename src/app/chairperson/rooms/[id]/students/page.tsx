'use client';
import { StudentsTab } from '@/components/chairperson/students-tab';
import { useUser } from '@/firebase';
import { Users } from 'lucide-react';

export default function StudentsPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  return (
    <div>
        <div className="flex items-center gap-4 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Students</h1>
        </div>
      {user && <StudentsTab roomId={params.id} chairpersonId={user.uid} />}
    </div>
  );
}
