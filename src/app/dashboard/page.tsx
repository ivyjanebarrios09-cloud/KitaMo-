'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (userLoading) return; // Wait until user status is resolved
    if (!user) {
      router.push('/login'); // If no user, redirect to login
      return;
    }

    const getUserRole = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role === 'chairperson') {
          router.replace('/chairperson/dashboard');
        } else {
          router.replace('/student/dashboard');
        }
      } else {
        // Handle case where user document doesn't exist, maybe redirect to an error page or logout
        console.error("User document not found in Firestore.");
        router.push('/login');
      }
    };

    getUserRole();
  }, [user, userLoading, db, router]);

  // Display a loading state while redirecting
  return (
     <div className="flex h-screen w-full items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Loading Your Dashboard</CardTitle>
          <CardDescription>
            Please wait while we redirect you...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
        </CardContent>
      </Card>
    </div>
  );
}
