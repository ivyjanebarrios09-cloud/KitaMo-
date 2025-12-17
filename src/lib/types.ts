import { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  uid: string; // Add uid to match firestore doc
  name: string;
  email: string;
  avatarUrl: string;
  role: 'chairperson' | 'student';
  displayName?: string;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  code: string;
  // chairpersonId is no longer needed as the room is nested under the user
  createdAt: Timestamp;
};

export type RoomMember = {
    id: string;
    // roomId is the document ID, not a field
    userId: string;
    role: 'chairperson' | 'student';
    joinedAt: Timestamp;
}

export type Expense = {
  id: string;
  // roomId is implicit from the path
  title: string;
  description: string;
  amount: number;
  date: string;
  createdBy: string;
};

export type FundDeadline = {
  id:string;
  // roomId is implicit from the path
  title: string;
  amountPerStudent: number;
  dueDate: string;
  month: string;
};


export type Payment = {
    id: string;
    // roomId is implicit from the path
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
