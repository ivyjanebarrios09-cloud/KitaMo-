'use client';
import {useEffect} from 'react';
import {errorEmitter} from '@/firebase/error-emitter';

// This is a client component that will listen for the permission-error event
// and throw an error to be caught by the Next.js error boundary.
// This is only active in development to aid in debugging security rules.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handler = (error: Error) => {
      if (process.env.NODE_ENV === 'development') {
        // In development, we want to see the full error overlay.
        // Throwing the error will be caught by Next.js's development error boundary.
        throw error;
      } else {
        // In production, you might want to log this to a service like Sentry
        // without crashing the entire app. For now, we'll just log it.
        console.error("Firebase Permission Error:", error.message);
      }
    };

    errorEmitter.on('permission-error', handler);

    return () => {
      errorEmitter.off('permission-error', handler);
    };
  }, []);

  return null;
}
