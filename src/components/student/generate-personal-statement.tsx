
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
  FileSpreadsheet,
  FileType,
  Eye,
  Loader2,
  Receipt,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { FundDeadline, Room, Payment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'sheetjs-style';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';

const statementOptions = [
  {
    key: 'personal_expense_report',
    icon: <Receipt className="h-6 w-6 text-primary" />,
    title: 'Personal Expense Report',
    description:
      'A detailed report of all your required contributions and payments for this room.',
  },
];

type LoadingState = {
  pdf: boolean;
  excel: boolean;
  view: boolean;
};

type StatementType = 'personal_expense_report';

type PreviewData = {
  title: string;
  description: string;
  data: any;
  type: StatementType;
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


export function GeneratePersonalStatement({ room, roomId, chairpersonId }: { room: Room, roomId: string, chairpersonId: string }) {
  const [loading, setLoading] = useState<Record<string, LoadingState>>({
    personal_expense_report: { pdf: false, excel: false, view: false },
  });

  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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

  const dataIsLoading = deadlinesLoading || paymentsLoading;

  const getStatementData = () => {
    if (!user || !deadlines || !payments) {
        toast({ title: "Data still loading...", description: "Please wait a moment and try again." });
        return null;
    }
    return { deadlines, payments };
  }

  const handleGeneratePDF = async () => {
    const data = getStatementData();
    if (!data || !user) return;
    
    setLoading(prev => ({ ...prev, personal_expense_report: { ...prev.personal_expense_report, pdf: true } }));

    try {
      if (data.deadlines.length === 0) {
        toast({ title: 'No Data', description: 'There are no fund deadlines to report.' });
        return;
      }
      
      const doc = new jsPDF() as jsPDFWithAutoTable;
      
      doc.setFontSize(20);
      doc.text("KitaMo! Personal Statement", 14, 22);
      doc.setFontSize(12);
      doc.text(`Student: ${user.displayName || user.email}`, 14, 30);
      doc.text(`Room: ${room.name}`, 14, 38);
      doc.text("Statement Type: Personal Expense Report", 14, 46);
      doc.setFontSize(10);
      doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 54);

      const tableColumn = ["Deadline Title", "Due Date", "Amount Due (PHP)", "Amount Paid (PHP)", "Status"];
      const tableRows: (string | number)[][] = [];

      let totalDue = 0;
      data.deadlines.forEach(deadline => {
        const paymentForDeadline = data.payments.find(p => p.deadlineId === deadline.id);
        const amountPaid = paymentForDeadline?.amount ?? 0;
        const isPaid = amountPaid >= deadline.amountPerStudent;
        tableRows.push([
          deadline.title,
          format(new Date(deadline.dueDate), 'PP'),
          deadline.amountPerStudent.toFixed(2),
          amountPaid.toFixed(2),
          isPaid ? 'Paid' : 'Unpaid'
        ]);
        totalDue += deadline.amountPerStudent;
      });

      const totalPaidByStudent = data.payments.reduce((sum, p) => sum + p.amount, 0);

      doc.autoTable({ startY: 60, head: [tableColumn], body: tableRows });

      const finalY = doc.autoTable.previous.finalY;
      doc.setFontSize(12);
      doc.text("Summary", 14, finalY + 10);
      doc.setFontSize(10);
      doc.text(`Total Amount Due: PHP ${totalDue.toFixed(2)}`, 14, finalY + 16);
      doc.text(`Total Amount Paid: PHP ${totalPaidByStudent.toFixed(2)}`, 14, finalY + 22);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Remaining Balance: PHP ${(totalDue - totalPaidByStudent).toFixed(2)}`, 14, finalY + 30);

      doc.save(`Personal_Statement_${user.displayName?.replace(/\s/g, '_')}_${room.name.replace(/\s/g, '_')}.pdf`);
      toast({ title: "PDF Generated", description: "Your personal statement has been downloaded." });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Error", description: "Failed to generate PDF summary.", variant: "destructive" });
    } finally {
      setLoading(prev => ({ ...prev, personal_expense_report: { ...prev.personal_expense_report, pdf: false } }));
    }
  }

  const handleGenerateExcel = async () => {
    const data = getStatementData();
    if (!data || !user) return;
    setLoading(prev => ({ ...prev, personal_expense_report: { ...prev.personal_expense_report, excel: true } }));

    try {
        if (data.deadlines.length === 0) throw new Error("No data to export.");

        const wb = XLSX.utils.book_new();
        const wsData = data.deadlines.map(deadline => {
            const paymentForDeadline = data.payments.find(p => p.deadlineId === deadline.id);
            const amountPaid = paymentForDeadline?.amount ?? 0;
            const isPaid = amountPaid >= deadline.amountPerStudent;
            return {
                'Deadline Title': deadline.title,
                'Due Date': format(new Date(deadline.dueDate), 'PP'),
                'Amount Due (PHP)': deadline.amountPerStudent,
                'Amount Paid (PHP)': amountPaid,
                'Status': isPaid ? 'Paid' : 'Unpaid'
            };
        });

        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Personal Statement");

        const fileName = `Personal_Statement_${user.displayName?.replace(/\s/g, '_')}_${room.name.replace(/\s/g, '_')}.xlsx`;
        XLSX.writeFile(wb, fileName);
        toast({ title: "Excel File Generated", description: "Your spreadsheet has been downloaded." });
    } catch(error: any) {
        toast({ title: "Error Generating Excel", description: error.message, variant: "destructive" });
    } finally {
        setLoading(prev => ({ ...prev, personal_expense_report: { ...prev.personal_expense_report, excel: false } }));
    }
  }

  const handleView = () => {
    const data = getStatementData();
    if (!data) return;
    
    setPreviewData({
      title: 'Personal Expense Report',
      description: 'A summary of all your required contributions and payments for this room.',
      data: data,
      type: 'personal_expense_report',
    });
    setIsViewModalOpen(true);
  }

  const renderPreviewContent = () => {
    if (!previewData) return null;
    const { data } = previewData;

    return (
        <Table>
            <TableHeader><TableRow><TableHead>Deadline</TableHead><TableHead>Due</TableHead><TableHead>Paid</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader>
            <TableBody>
                {data.deadlines.length > 0 ? data.deadlines.map((deadline: FundDeadline) => {
                    const payment = data.payments.find((p: Payment) => p.deadlineId === deadline.id);
                    const amountPaid = payment?.amount ?? 0;
                    const isPaid = amountPaid >= deadline.amountPerStudent;
                    return (
                        <TableRow key={deadline.id}>
                            <TableCell>{deadline.title}</TableCell>
                            <TableCell>₱{deadline.amountPerStudent.toFixed(2)}</TableCell>
                            <TableCell>₱{amountPaid.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={isPaid ? 'secondary' : 'destructive'}>{isPaid ? 'Paid' : 'Unpaid'}</Badge>
                            </TableCell>
                        </TableRow>
                    )
                }) : <TableRow><TableCell colSpan={4} className="text-center">No deadlines to report.</TableCell></TableRow>}
            </TableBody>
        </Table>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Download Personal Statement</CardTitle>
        <CardDescription>
          Select a statement type to view, download, or export your financial data for this room.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-1">
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
            <CardFooter className="flex flex-wrap justify-end gap-2">
               <Button 
                variant="outline" 
                onClick={handleView}
                disabled={loading[option.key]?.view || dataIsLoading}
              >
                {loading[option.key]?.view ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                View
              </Button>
              <Button 
                variant="outline" 
                onClick={handleGeneratePDF}
                disabled={loading[option.key]?.pdf || dataIsLoading}
              >
                {loading[option.key]?.pdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileType className="mr-2 h-4 w-4" />}
                PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={handleGenerateExcel}
                disabled={loading[option.key]?.excel || dataIsLoading}
              >
                {loading[option.key]?.excel ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                Excel
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>

    <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
            <DialogTitle>{previewData?.title}</DialogTitle>
            <DialogDescription>
                {previewData?.description}
            </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] p-1">
                <div className="p-4">
                    {renderPreviewContent()}
                </div>
            </ScrollArea>
        </DialogContent>
    </Dialog>
    </>
  );
}
