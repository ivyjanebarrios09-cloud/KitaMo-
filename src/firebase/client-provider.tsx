'use client';

import {useEffect, useState} from 'react';
import type {Auth} from 'firebase/auth';
import type {FirebaseApp} from 'firebase/app';
import type {Firestore} from 'firebase/firestore';
import {FirebaseProvider} from '@/firebase/provider';
import { getFirebase } from '@/firebase';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
  } | null>(null);

  useEffect(() => {
    const instances = getFirebase();
    if (instances) {
      setFirebase(instances);
    }
  }, []);

  if (!firebase) {
    // You can return a loader here
    return null;
  }

  return <FirebaseProvider firebase={firebase}>{children}</FirebaseProvider>;
}
