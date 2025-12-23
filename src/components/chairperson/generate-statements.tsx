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
import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { Expense, Room, Payment, FundDeadline, RoomMember, User as UserData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, getYear, getMonth } from 'date-fns';

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

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


export function GenerateStatements({ room, roomId }: { room: Room, roomId: string }) {
  const [selectedMonth, setSelectedMonth] = useState<string>(`${getMonth(new Date())}`);
  const [selectedYear, setSelectedYear] = useState<string>(`${getYear(new Date())}`);
  const [loading, setLoading] = useState<Record<string, LoadingState>>({
    yearly: { pdf: false, excel: false, view: false },
    monthly: { pdf: false, excel: false, view: false },
    collection_summary: { pdf: false, excel: false, view: false },
    expense_summary: { pdf: false, excel: false, view: false },
  });
  
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const basePath = useMemo(() => user ? `users/${user.uid}/rooms/${roomId}` : null, [user, roomId]);

  const { data: expenses, loading: expensesLoading } = useCollection<Expense>(basePath ? `${basePath}/expenses` : null);
  const { data: payments, loading: paymentsLoading } = useCollection<Payment>(basePath ? `${basePath}/payments` : null);
  const { data: deadlines, loading: deadlinesLoading } = useCollection<FundDeadline>(basePath ? `${basePath}/deadlines` : null);
  const { data: members, loading: membersLoading } = useCollection<RoomMember>(basePath ? `${basePath}/members` : null);
  const [memberDetails, setMemberDetails] = useState<Record<string, UserData>>({});

  useEffect(() => {
    if (members && members.length > 0) {
      const fetchMemberDetails = async () => {
        const memberIds = members.map(m => m.userId);
        const newMemberDetails: Record<string, UserData> = {};
        for (const id of memberIds) {
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', id)));
          if (!userDoc.empty) {
             const userDocData = userDoc.docs[0].data() as UserData;
             newMemberDetails[id] = userDocData;
          }
        }
        setMemberDetails(newMemberDetails);
      };
      fetchMemberDetails();
    }
  }, [members, db]);

  const yearOptions = useMemo(() => {
    const allDates = [
        ...(expenses?.map(e => new Date(e.date)) ?? []),
        ...(payments?.map(p => new Date(p.date)) ?? []),
        ...(deadlines?.map(d => new Date(d.dueDate)) ?? []),
    ];
    if (allDates.length === 0) return [getYear(new Date()).toString()];
    const years = new Set(allDates.map(date => getYear(date)));
    return Array.from(years).sort((a,b) => b - a).map(String);
  }, [expenses, payments, deadlines]);

  const generatePdf = async (type: string) => {
     if (!user || !expenses || !payments || !deadlines || !members) {
      toast({ title: "Data still loading...", description: "Please wait a moment and try again." });
      return;
    }
    
    setLoading(prev => ({ ...prev, [type]: { ...prev[type], pdf: true } }));

    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    try {
        doc.setFontSize(20);
        doc.text("KitaMo! Financial Statement", 14, 22);
        doc.setFontSize(14);
        doc.text(`Room: ${room.name}`, 14, 30);
        doc.setFontSize(10);
        doc.text(`Generated by: ${user.displayName || user.email}`, 14, 38);
        doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 46);

        let finalY = 50;
        let fileName = `${type}_${room.name.replace(/\s/g, '_')}.pdf`;

        if (type === 'expense_summary') {
            doc.setFontSize(14);
            doc.text("Statement Type: Summary of Expenses", 14, 54);
            finalY = 60;
            if (expenses.length === 0) throw new Error("No expenses to report.");

            const tableColumn = ["Date", "Title", "Description", "Amount (PHP)"];
            const tableRows = expenses.map(e => [
                format(new Date(e.date), 'PP'),
                e.title,
                e.description,
                e.amount.toFixed(2),
            ]);
            doc.autoTable({ startY: finalY, head: [tableColumn], body: tableRows });
            finalY = doc.autoTable.previous.finalY;
            
            const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
            doc.setFontSize(12);
            doc.text(`Total Expenses: PHP ${totalExpenses.toFixed(2)}`, 14, finalY + 10);
        } else if (type === 'collection_summary') {
            doc.setFontSize(14);
            doc.text("Statement Type: Summary of Collection", 14, 54);
            finalY = 60;
            if (members.length === 0) throw new Error("No members to report.");

            const totalDuePerStudent = deadlines.reduce((sum, d) => sum + d.amountPerStudent, 0);

            const tableColumn = ["Student Name", "Total Due (PHP)", "Total Paid (PHP)", "Balance (PHP)"];
            const tableRows = members.map(member => {
                const studentName = memberDetails[member.userId]?.name || 'Loading...';
                const totalPaidByStudent = payments.filter(p => p.userId === member.userId).reduce((sum, p) => sum + p.amount, 0);
                return [
                    studentName,
                    totalDuePerStudent.toFixed(2),
                    totalPaidByStudent.toFixed(2),
                    (totalDuePerStudent - totalPaidByStudent).toFixed(2)
                ];
            });

            doc.autoTable({ startY: finalY, head: [tableColumn], body: tableRows });
            finalY = doc.autoTable.previous.finalY;
            
            const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
            const totalOwed = (totalDuePerStudent * members.length) - totalCollected;
            doc.setFontSize(12);
            doc.text(`Total Collected: PHP ${totalCollected.toFixed(2)}`, 14, finalY + 10);
            doc.text(`Total Outstanding Balance: PHP ${totalOwed.toFixed(2)}`, 14, finalY + 16);
        } else if (type === 'monthly' || type === 'yearly') {
            const year = parseInt(selectedYear);
            const month = type === 'monthly' ? parseInt(selectedMonth) : undefined;
            const period = type === 'monthly' ? `${format(new Date(year, month!), 'MMMM')} ${year}` : `the Year ${year}`;
            doc.setFontSize(14);
            doc.text(`Statement Type: Financial Report for ${period}`, 14, 54);
            fileName = `${type}_${period.replace(/\s/g, '_')}_${room.name.replace(/\s/g, '_')}.pdf`;
            finalY = 60;

            const filteredPayments = payments.filter(p => {
                const pDate = new Date(p.date);
                return getYear(pDate) === year && (month === undefined || getMonth(pDate) === month);
            });
            const filteredExpenses = expenses.filter(e => {
                const eDate = new Date(e.date);
                return getYear(eDate) === year && (month === undefined || getMonth(eDate) === month);
            });

            if (filteredPayments.length === 0 && filteredExpenses.length === 0) {
                throw new Error(`No financial activity for ${period}.`);
            }

            doc.setFontSize(12);
            doc.text("Funds Collected", 14, finalY);
            doc.autoTable({
                startY: finalY + 2,
                head: [["Date", "Student", "Note", "Amount (PHP)"]],
                body: filteredPayments.map(p => [
                    format(new Date(p.date), 'PP'),
                    memberDetails[p.userId]?.name || p.userId.slice(0, 5),
                    p.note,
                    p.amount.toFixed(2)
                ]),
            });
            finalY = doc.autoTable.previous.finalY;
            
            doc.text("Expenses", 14, finalY + 10);
            doc.autoTable({
                startY: finalY + 12,
                head: [["Date", "Title", "Description", "Amount (PHP)"]],
                body: filteredExpenses.map(e => [
                    format(new Date(e.date), 'PP'),
                    e.title,
                    e.description,
                    e.amount.toFixed(2)
                ]),
            });
            finalY = doc.autoTable.previous.finalY;

            const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
            const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
            doc.setFontSize(12);
            doc.text("Summary for Period", 14, finalY + 10);
            doc.text(`Total Collected: PHP ${totalCollected.toFixed(2)}`, 14, finalY + 16);
            doc.text(`Total Expenses: PHP ${totalExpenses.toFixed(2)}`, 14, finalY + 22);
            doc.setFont('helvetica', 'bold');
            doc.text(`Net Change: PHP ${(totalCollected - totalExpenses).toFixed(2)}`, 14, finalY + 28);
            doc.setFont('helvetica', 'normal');
        }

        doc.save(fileName);
        toast({ title: "PDF Generated", description: "Your document has been downloaded." });
    } catch(error: any) {
        toast({ title: "Error Generating PDF", description: error.message, variant: "destructive" });
    } finally {
        setLoading(prev => ({ ...prev, [type]: { ...prev[type], pdf: false } }));
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
              {(option.key === 'monthly' || option.key === 'yearly') && (
                <div className="flex flex-col sm:flex-row gap-2">
                  {option.key === 'monthly' && (
                    <div className="space-y-2 flex-1">
                      <label className="text-sm font-medium">Select Month</label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a month..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i} value={`${i}`}>
                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                  )}
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Select Year</label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger>
                              <SelectValue placeholder="Choose a year..." />
                          </SelectTrigger>
                          <SelectContent>
                              {yearOptions.map((year) => (
                                  <SelectItem key={year} value={year}>
                                      {year}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" disabled>View</Button>
              <Button 
                variant="outline" 
                disabled={loading[option.key]?.pdf}
                onClick={() => generatePdf(option.key)}
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
