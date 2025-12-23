'use client';
import { ExpensesTab } from '@/components/chairperson/expenses-tab';
import { Wallet } from 'lucide-react';

export default function ExpensesPage({ params }: { params: { id: string } }) {
  return (
     <div>
        <div className="flex items-center gap-4 mb-4">
            <Wallet className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Expenses</h1>
        </div>
      <ExpensesTab roomId={params.id} />
    </div>
  );
}
