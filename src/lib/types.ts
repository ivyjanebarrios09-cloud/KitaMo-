import { Timestamp } from 'firebase/firestore';

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
  code: string;
  chairpersonId: string;
  createdAt: Timestamp;
};

export type RoomMember = {
    id: string;
    roomId: string;
    userId: string;
    role: 'chairperson' | 'student';
    joinedAt: Timestamp;
}

export type Expense = {
  id: string;
  roomId: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  createdBy: string;
};

export type FundDeadline = {
  id:string;
  roomId: string;
  title: string;
  amountPerStudent: number;
  dueDate: string;
  month: string;
};


export type Payment = {
    id: string;
    roomId: string;
    userId: string;
    amount: number;
    date: string;
    note?: string;
}

export type StudentPaymentDetails = {
  student: User;
  amountPaid: number;
  remainingBalance: number;
  paymentHistory: { date: string; amount: number }[];
};
