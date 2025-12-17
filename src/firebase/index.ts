import {initializeApp, getApp, getApps, type FirebaseApp} from 'firebase/app';
import {firebaseConfig} from './config';

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
