'use client';

import {createContext, useContext} from 'react';
import type {FirebaseApp} from 'firebase/app';
import {getAuth, type Auth} from 'firebase/auth';
import {getFirestore, type Firestore} from 'firebase/firestore';

export type FirebaseContextValue = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const getFirebase = {
  app: () => {
    const context = useContext(FirebaseContext);
    if (!context)
      throw new Error('Firebase context not found. Are you in a provider?');
    return context.app;
  },
  auth: () => {
    const context = useContext(FirebaseContext);
    if (!context)
      throw new Error('Firebase context not found. Are you in a provider?');
    return getAuth(context.app);
  },
  db: () => {
    const context = useContext(FirebaseContext);
    if (!context)
      throw new Error('Firebase context not found. Are you in a provider?');
    return getFirestore(context.app);
  },
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export function FirebaseProvider({
  children,
  firebase,
}: {
  children: React.ReactNode;
  firebase: {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
  };
}) {
  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}