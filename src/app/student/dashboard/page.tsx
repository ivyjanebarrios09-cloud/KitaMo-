import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { JoinRoomButton } from '@/components/student/join-room-button';

const rooms = [
  {
    id: 'room1',
    name: 'Fall 2024 Engineering Ball',
    chairperson: 'Dr. Evelyn Reed',
    totalDue: 50,
    amountPaid: 50,
  },
  {
    id: 'room2',
    name: 'Startup Club Member Dues',
    chairperson: 'Prof. Alex Chen',
    totalDue: 50,
    amountPaid: 25,
  },
];

export default function StudentDashboard() {
  const totalDue = rooms.reduce((acc, room) => acc + room.totalDue, 0);
  const totalPaid = rooms.reduce((acc, room) => acc + room.amountPaid, 0);
  const overallProgress = totalDue > 0 ? (totalPaid / totalDue) * 100 : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome! Here is your financial overview.
          </p>
        </div>
        <JoinRoomButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Financial Status</CardTitle>
          <CardDescription>
            A summary of your payments across all rooms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Progress value={overallProgress} />
            <div className="flex justify-between text-sm font-medium">
              <span>Total Paid: ${totalPaid.toLocaleString()}</span>
              <span className="text-muted-foreground">Total Due: ${totalDue.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">My Rooms</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {rooms.map((room) => {
            const progress = room.totalDue > 0 ? (room.amountPaid / room.totalDue) * 100 : 100;
            const balance = room.totalDue - room.amountPaid;

            return (
              <Card key={room.id}>
                <CardHeader>
                  <CardTitle>{room.name}</CardTitle>
                  <CardDescription>
                    Managed by {room.chairperson}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                   <Progress value={progress} />
                   <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">
                        Balance: <span className={balance > 0 ? "text-red-600" : "text-green-600"}>${balance.toLocaleString()}</span>
                      </span>
                      <span className="text-muted-foreground">Paid: ${room.amountPaid.toLocaleString()} / ${room.totalDue.toLocaleString()}</span>
                   </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/student/rooms/${room.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
