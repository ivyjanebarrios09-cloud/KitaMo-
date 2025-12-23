'use client';

import React from 'react';
import {
  DollarSign,
  Users,
  CreditCard,
  ClipboardList,
  AreaChart,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RoomDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = React.use(params);

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱0.00</div>
              <p className="text-xs text-muted-foreground">Awaiting calculations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No members yet</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱0.00</div>
              <p className="text-xs text-muted-foreground">No payments recorded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱0.00</div>
              <p className="text-xs text-muted-foreground">No outstanding members</p>
            </CardContent>
          </Card>
        </div>
         <div className="mt-4">
          <Card>
            <CardHeader>
                <CardTitle>Expense Analytics</CardTitle>
                 <p className="text-sm text-muted-foreground">
                    Visualize your room's spending patterns over time.
                  </p>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center gap-4">
                     <AreaChart className="h-10 w-10 text-primary" />
                     <div>
                         <h3 className="font-semibold">Expense Graphs</h3>
                         <p className="text-sm text-muted-foreground">View detailed monthly and yearly expense charts.</p>
                     </div>
                     <Link href={`/chairperson/rooms/${roomId}/graphs`} className="ml-auto">
                        <Button>View Graphs</Button>
                     </Link>
                 </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
