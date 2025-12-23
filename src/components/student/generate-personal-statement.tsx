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
  Receipt,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { FundDeadline, Room, User, Payment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

const statementOptions = [
  {
    key: 'personal_expense_report',
    icon: <Receipt className="h-6 w-6 text-primary" />,
    title: 'Personal Expense Report',
    description:
      'A detailed report of all your required contributions and payments for this room.',
  },
  {
    key: 'monthly',
    icon: <CalendarDays className="h-6 w-6 text-primary" />,
    title: 'Monthly Personal Statement (Coming Soon)',
    description:
      'A report of your financial activities for a single selected month.',
  },
  
];

type LoadingState = {
  pdf: boolean;
  excel: boolean;
  view: boolean;
};

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


export function GeneratePersonalStatement({ room, roomId, chairpersonId }: { room: Room, roomId: string, chairpersonId: string }) {
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [loading, setLoading] = useState<Record<string, LoadingState>>({
    personal_expense_report: { pdf: false, excel: false, view: false },
    monthly: { pdf: false, excel: false, view: false },
  });

  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const basePath = useMemo(() => chairpersonId && roomId ? `users/${chairpersonId}/rooms/${roomId}` : null, [chairpersonId, roomId]);

  const { data: deadlines, loading: deadlinesLoading } = useCollection<FundDeadline>(basePath ? `${basePath}/deadlines` : null);
  
  const paymentsQuery = useMemo(() => {
    if (!basePath || !user) return null;
    return query(collection(db, `${basePath}/payments`), where('userId', '==', user.uid));
  }, [db, basePath, user]);
  const { data: payments, loading: paymentsLoading } = useCollection<Payment>(paymentsQuery);


  const handleGeneratePDF = async () => {
    if (!user || !deadlines || !payments) {
        toast({ title: "Data still loading...", description: "Please wait a moment and try again." });
        return;
    }
    setLoading(prev => ({ ...prev, personal_expense_report: { ...prev.personal_expense_report, pdf: true } }));

    try {
      if (deadlines.length === 0) {
        toast({
          title: 'No Data',
          description: 'There are no fund deadlines to generate a statement for.',
          variant: 'destructive',
        });
        return;
      }
      
      const doc = new jsPDF() as jsPDFWithAutoTable;
      
      // Header
      doc.setFontSize(20);
      doc.text("KitaMo! Personal Statement", 14, 22);
      doc.setFontSize(12);
      doc.text(`Student: ${user.displayName || user.email}`, 14, 30);
      doc.text(`Room: ${room.name}`, 14, 38);
      doc.text("Statement Type: Personal Expense Report", 14, 46);
      doc.setFontSize(10);
      doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 54);

      // Table
      const tableColumn = ["Deadline Title", "Due Date", "Amount Due (PHP)", "Amount Paid (PHP)", "Status"];
      const tableRows: (string | number)[][] = [];

      let totalDue = 0;
      let totalPaidByStudent = 0;
      
      deadlines.forEach(deadline => {
        const paymentForDeadline = payments.find(p => p.deadlineId === deadline.id);
        const amountPaid = paymentForDeadline?.amount ?? 0;
        const isPaid = amountPaid >= deadline.amountPerStudent;

        const deadlineData = [
          deadline.title,
          format(new Date(deadline.dueDate), 'PP'),
          deadline.amountPerStudent.toFixed(2),
          amountPaid.toFixed(2),
          isPaid ? 'Paid' : 'Unpaid'
        ];
        tableRows.push(deadlineData);
        totalDue += deadline.amountPerStudent;
      });

      totalPaidByStudent = payments.reduce((sum, p) => sum + p.amount, 0);

      doc.autoTable({
        startY: 60,
        head: [tableColumn],
        body: tableRows,
      });

      // Summary
      const finalY = doc.autoTable.previous.finalY;
      doc.setFontSize(12);
      doc.text("Summary", 14, finalY + 10);
      doc.setFontSize(10);
      doc.text(`Total Amount Due: PHP ${totalDue.toFixed(2)}`, 14, finalY + 16);
      doc.text(`Total Amount Paid: PHP ${totalPaidByStudent.toFixed(2)}`, 14, finalY + 22);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Remaining Balance: PHP ${(totalDue - totalPaidByStudent).toFixed(2)}`, 14, finalY + 30);
      doc.setFont('helvetica', 'normal');

      // Footer
      doc.setFontSize(8);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);

      doc.save(`Personal_Statement_${user.displayName?.replace(/\s/g, '_')}_${room.name.replace(/\s/g, '_')}.pdf`);
      toast({ title: "PDF Generated", description: "Your personal statement has been downloaded." });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF summary.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, personal_expense_report: { ...prev.personal_expense_report, pdf: false } }));
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Personal Statement</CardTitle>
        <CardDescription>
          Select a statement type to view, download, or export your financial data for this room.
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
                   <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled>
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
              <Button variant="outline" disabled>View</Button>
              <Button 
                variant="outline" 
                disabled={option.key !== 'personal_expense_report' || loading[option.key]?.pdf || deadlinesLoading || paymentsLoading}
                onClick={option.key === 'personal_expense_report' ? handleGeneratePDF : undefined}
                >
                {loading[option.key]?.pdf ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FileType className="mr-2 h-4 w-4" />
                )}
                 PDF
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
