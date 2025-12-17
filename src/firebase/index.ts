import {initializeApp, getApp, getApps, type FirebaseApp} from 'firebase/app';
import {firebaseConfig} from './config';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

function initializeFirebase(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  } else {
    return getApp();
  }
}

export {initializeFirebase};
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';

export interface FirebaseInstances {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

export function getFirebase(): FirebaseInstances {
  const app = initializeFirebase();
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}
