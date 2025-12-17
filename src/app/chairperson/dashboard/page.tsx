import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Users } from 'lucide-react';
import { CreateRoomButton } from '@/components/chairperson/create-room-button';

const rooms = [
  {
    id: 'room1',
    name: 'Fall 2024 Engineering Ball',
    studentCount: 152,
    fundsCollected: 7600,
    unpaidBalance: 1200,
  },
  {
    id: 'room2',
    name: 'Startup Club Member Dues',
    studentCount: 48,
    fundsCollected: 2400,
    unpaidBalance: 0,
  },
  {
    id: 'room3',
    name: 'Art Society Trip to Museum',
    studentCount: 25,
    fundsCollected: 375,
    unpaidBalance: 250,
  },
];

export default function ChairpersonDashboard() {
  const totalStudents = rooms.reduce((acc, room) => acc + room.studentCount, 0);
  const totalCollected = rooms.reduce((acc, room) => acc + room.fundsCollected, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, here&apos;s a summary of your financial rooms.
          </p>
        </div>
        <CreateRoomButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funds Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCollected.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Rooms</h2>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>Join Code: <span className="font-mono bg-muted px-2 py-1 rounded-md">XYZ-123</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Students</span>
                  <span className="font-medium">{room.studentCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Funds Collected</span>
                  <span className="font-medium text-green-600">${room.fundsCollected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Unpaid Balance</span>
                  <span className="font-medium text-red-600">${room.unpaidBalance.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
