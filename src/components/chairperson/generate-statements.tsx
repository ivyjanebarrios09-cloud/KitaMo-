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
import {
  FileSpreadsheet,
  FileType,
  BarChart,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Expense, Room } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

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

type LoadingState = {
  pdf: boolean;
  excel: boolean;
  view: boolean;
};

export function GenerateStatements({ room, roomId }: { room: Room, roomId: string }) {
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [loading, setLoading] = useState<Record<string, LoadingState>>({
    yearly: { pdf: false, excel: false, view: false },
    monthly: { pdf: false, excel: false, view: false },
    collection_summary: { pdf: false, excel: false, view: false },
    expense_summary: { pdf: false, excel: false, view: false },
  });

  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const handleGenerateExpenseSummaryPDF = async () => {
    if (!user) return;
    setLoading(prev => ({ ...prev, expense_summary: { ...prev.expense_summary, pdf: true } }));

    try {
      const expensesQuery = query(collection(db, `users/${user.uid}/rooms/${roomId}/expenses`));
      const querySnapshot = await getDocs(expensesQuery);
      const expenses = querySnapshot.docs.map(doc => doc.data() as Expense);

      if (expenses.length === 0) {
        toast({
          title: 'No Data',
          description: 'There are no expenses to generate a statement for.',
          variant: 'destructive',
        });
        return;
      }
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text("KitaMo! Financial Statement", 14, 22);
      doc.setFontSize(14);
      doc.text(`Room: ${room.name}`, 14, 30);
      doc.text("Statement Type: Summary of Expenses", 14, 38);
      doc.setFontSize(10);
      doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 46);

      // Table
      const tableColumn = ["Date", "Title", "Description", "Amount (PHP)"];
      const tableRows: (string | number)[][] = [];

      let totalExpenses = 0;
      expenses.forEach(expense => {
        const expenseData = [
          format(new Date(expense.date), 'PP'),
          expense.title,
          expense.description,
          expense.amount.toFixed(2),
        ];
        tableRows.push(expenseData);
        totalExpenses += expense.amount;
      });

      (doc as any).autoTable({
        startY: 50,
        head: [tableColumn],
        body: tableRows,
      });

      // Summary
      const finalY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(12);
      doc.text("Summary", 14, finalY + 10);
      doc.setFontSize(10);
      doc.text(`Total Expenses: PHP ${totalExpenses.toFixed(2)}`, 14, finalY + 16);

      // Footer
      doc.setFontSize(8);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);

      doc.save(`Expense_Summary_${room.name.replace(/\s/g, '_')}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF summary.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, expense_summary: { ...prev.expense_summary, pdf: false } }));
    }
  }


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
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" disabled={option.key !== 'expense_summary'}>View Statement</Button>
              <Button 
                variant="outline" 
                disabled={option.key !== 'expense_summary' || loading[option.key]?.pdf}
                onClick={option.key === 'expense_summary' ? handleGenerateExpenseSummaryPDF : undefined}
                >
                {loading[option.key]?.pdf ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FileType className="mr-2 h-4 w-4" />
                )}
                 PDF
              </Button>
              <Button variant="outline" disabled={option.key !== 'expense_summary'}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
