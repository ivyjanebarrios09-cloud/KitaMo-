'use client';

import {useEffect, useState} from 'react';
import type {Auth} from 'firebase/auth';
import type {FirebaseApp} from 'firebase/app';
import type {Firestore} from 'firebase/firestore';
import {FirebaseProvider, getFirebase} from '@/firebase/provider';
import {initializeFirebase} from '@/firebase';

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
    const firebaseInstance = initializeFirebase();
    if (firebaseInstance) {
      const auth = getFirebase.auth();
      const db = getFirebase.db();
      setFirebase({app: firebaseInstance, auth, db});
    }
  }, []);

  if (!firebase) {
    return null;
  }

  return <FirebaseProvider firebase={firebase}>{children}</FirebaseProvider>;
}