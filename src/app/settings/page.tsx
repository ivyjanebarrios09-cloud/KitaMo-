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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';
import {
  User,
  ClipboardList,
  Users,
  Lock,
  Edit,
  KeyRound,
  ShieldCheck,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'avatar1');

export default function SettingsPage() {
  const { user, loading } = useUser();

  const userProfileOptions = [
    {
      icon: <User className="h-5 w-5" />,
      title: 'Nickname',
      content: 'Update your display name.',
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      title: `Role: ${
        (user as any)?.role === 'chairperson'
          ? 'Finance Chairperson'
          : 'Student'
      }`,
      content: 'Your role determines your permissions across the app.',
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Grade & Section',
      content: 'Your grade and section information.',
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: 'Password',
      content: 'Manage your password.',
    },
  ];

  const controlsAndSettingsOptions = [
    {
      icon: <Edit className="h-5 w-5" />,
      title: 'Edit Profile',
      content: 'Update your personal information.',
    },
    {
      icon: <KeyRound className="h-5 w-5" />,
      title: 'Change Password',
      content: 'Update your account password.',
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: 'Privacy Settings',
      content: 'Control your privacy preferences.',
    },
    {
      icon: <LogOut className="h-5 w-5" />,
      title: 'Log Out',
      content: 'Log out of your account.',
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="flex items-center gap-4">
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

            <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {userProfileOptions.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-lg">
                        <div className="flex items-center gap-4">
                          {item.icon}
                          {item.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>{item.content}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Controls & Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {controlsAndSettingsOptions.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`control-item-${index}`}
                    >
                      <AccordionTrigger className="text-lg">
                        <div className="flex items-center gap-4">
                          {item.icon}
                          {item.title}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>{item.content}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
