'use client';

import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SignOutButton() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/');
    } catch (error) {
       console.error('Logout Error:', error);
       toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <Button variant="destructive" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  );
}
