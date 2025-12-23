'use client';

import React from 'react';
import {
  DollarSign,
  Users,
  CreditCard,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function RoomDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = React.use(params);

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 mt-4">
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
        </div>
    </div>
  );
}
