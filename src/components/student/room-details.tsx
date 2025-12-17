'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function StudentRoomDetails() {
  return (
    <Tabs defaultValue="dashboard">
      <TabsList>
        <TabsTrigger value="dashboard">My Dashboard</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Your Financial Summary</CardTitle>
            <CardDescription>For 'Fall 2024 Engineering Ball'</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold">Current Balance</h3>
                <p className="text-4xl font-bold text-red-600">$25.00 <span className="text-lg font-normal text-muted-foreground">due</span></p>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>Payment Progress</span>
                    <span>50%</span>
                </div>
                <Progress value={50} />
                 <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Paid: $25.00</span>
                    <span>Total: $50.00</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="expenses">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Room Expenses</CardTitle>
            <CardDescription>All expenses posted for this room.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>2024-04-15</TableCell>
                        <TableCell>Venue Deposit</TableCell>
                        <TableCell className="text-right">$2,500.00</TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell>2024-04-22</TableCell>
                        <TableCell>Catering Service</TableCell>
                        <TableCell className="text-right">$4,000.00</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="deadlines">
         <Card className="mt-4">
          <CardHeader>
            <CardTitle>Fund Deadlines</CardTitle>
            <CardDescription>Upcoming and past due payments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount Required</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="bg-red-50 dark:bg-red-900/20">
                        <TableCell className="font-medium">Ticket First Installment</TableCell>
                        <TableCell>2024-03-31</TableCell>
                        <TableCell><Badge variant="destructive">Overdue</Badge></TableCell>
                        <TableCell>$25.00</TableCell>
                        <TableCell>$0.00</TableCell>
                        <TableCell className="text-right"><Button size="sm">Pay Now</Button></TableCell>
                    </TableRow>
                     <TableRow>
                        <TableCell className="font-medium">Ticket Final Payment</TableCell>
                        <TableCell>2024-04-30</TableCell>
                        <TableCell><Badge variant="secondary">Upcoming</Badge></TableCell>
                         <TableCell>$25.00</TableCell>
                        <TableCell>$25.00</TableCell>
                        <TableCell className="text-right"><Button size="sm" variant="outline" disabled>Pay Now</Button></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
