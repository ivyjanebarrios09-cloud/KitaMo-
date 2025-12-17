'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  doc,
  onSnapshot,
  DocumentReference,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface UseDocOptions {
  // Add any options here
}

export function useDoc<T = DocumentData>(
  path: string,
  options?: UseDocOptions
) {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedRef = useMemo(() => {
    if (!path) return null;
    return doc(db, path);
     // Re-create the ref only if path or options change
  }, [db, path]);

  useEffect(() => {
    if (!memoizedRef) {
        setLoading(false);
        return;
    };

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id } as T);
        } else {
          setData(null); // Document does not exist
        }
        setLoading(false);
        setError(null);
      },
      async (err: FirestoreError) => {
        if (err.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: memoizedRef.path,
              operation: 'get',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            setError(permissionError);
        } else {
          console.error("Error fetching document:", err);
          setError(err);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedRef]);

  return { data, loading, error };
}
