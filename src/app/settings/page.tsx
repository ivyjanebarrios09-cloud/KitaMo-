'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useAuth } from '@/firebase';
import { User as UserIcon, Lock, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UpdateProfileForm } from '@/components/settings/update-profile-form';
import { SignOutButton } from '@/components/settings/signout-button';
import { Skeleton } from '@/components/ui/skeleton';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'avatar1');

export default function SettingsPage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4 sm:p-6 md:p-8">
             <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-8 w-48" />
             </div>
             <div className="mx-auto grid w-full max-w-2xl gap-6 mt-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div>
                        <Skeleton className="h-7 w-32" />
                        <Skeleton className="mt-2 h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
             </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="flex items-center gap-4 pt-4">
          <Link href="/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-2xl gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {userAvatar && (
                <AvatarImage src={userAvatar.imageUrl} alt="User avatar" />
              )}
              <AvatarFallback>
                {user?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user?.displayName}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <UpdateProfileForm />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Account Security</CardTitle>
              <CardDescription>Manage your password and log out from your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Click the button below to sign out of your account on this device.</p>
                <SignOutButton />
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
