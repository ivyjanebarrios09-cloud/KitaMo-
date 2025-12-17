'use client';

import {useEffect, useState} from 'react';
import type {Auth} from 'firebase/auth';
import type {FirebaseApp} from 'firebase/app';
import type {Firestore} from 'firebase/firestore';
import {FirebaseProvider} from '@/firebase/provider';
import {initializeFirebase} from '@/firebase';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
    const app = initializeFirebase();
    if (app) {
      const auth = getAuth(app);
      const db = getFirestore(app);
      setFirebase({app, auth, db});
    }
  }, []);

  if (!firebase) {
    return null;
  }

  return <FirebaseProvider firebase={firebase}>{children}</FirebaseProvider>;
}
