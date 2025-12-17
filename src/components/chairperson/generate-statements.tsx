'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileSpreadsheet, FileType, BarChart, CalendarDays } from 'lucide-react';
import { useState } from 'react';

const statementOptions = [
  {
    key: 'yearly',
    icon: <CalendarDays className="h-6 w-6 text-primary" />,
    title: 'Financial Statement for the Whole Year',
    description:
      'A comprehensive report of all expenses, deadlines, and payments for the entire year.',
  },
  {
    key: 'monthly',
    icon: <CalendarDays className="h-6 w-6 text-primary" />,
    title: 'Financial Statement for a Specific Month',
    description:
      'A detailed report of all financial activities for a single selected month.',
  },
  {
    key: 'collection_summary',
    icon: <BarChart className="h-6 w-6 text-primary" />,
    title: 'Summary of Collection',
    description:
      'An overview of total funds collected, payment status per student, and collection progress.',
  },
  {
    key: 'expense_summary',
    icon: <FileSpreadsheet className="h-6 w-6 text-primary" />,
    title: 'Summary of Expenses',
    description:
      'A breakdown of all expenses, showing where the collected funds were spent.',
  },
];

export function GenerateStatements({ roomId }: { roomId: string }) {
  const [selectedMonth, setSelectedMonth] = useState<string>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Statements</CardTitle>
        <CardDescription>
          Select a statement type to view, download, or export financial data for this room.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {statementOptions.map((option) => (
          <Card key={option.key} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start gap-4">
                {option.icon}
                <div className="space-y-1">
                  <CardTitle>{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {option.key === 'monthly' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Month</label>
                   <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose a month..." />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i} value={`${i + 1}`}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" disabled>View Statement</Button>
              <Button variant="outline" disabled>
                <FileType className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button variant="outline" disabled>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
