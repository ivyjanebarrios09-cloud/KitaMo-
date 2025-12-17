
export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'chairperson' | 'student';
};

export type Room = {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  chairpersonId: string;
};

export type Expense = {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  roomId: string;
};

export type FundDeadline = {
  id: string;
  title: string;
  description: string;
  amountPerStudent: number;
  dueDate: string;
  billingPeriod: string;
  totalExpected: number;
  remainingBalance: number;
  roomId: string;
};

export type StudentPaymentDetails = {
  student: User;
  amountPaid: number;
  remainingBalance: number;
  paymentHistory: { date: string; amount: number }[];
};
