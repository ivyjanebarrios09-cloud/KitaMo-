'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface UseCollectionOptions {
  // Add any options here, e.g., for filtering or sorting
}

export function useCollection<T = DocumentData>(
  path: string,
  options?: UseCollectionOptions
) {
  const db = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedQuery = useMemo(() => {
    if (!path) return null;
    return query(collection(db, path));
    // Re-create the query only if path or options change
  }, [db, path]);

  useEffect(() => {
    if (!memoizedQuery) {
        setLoading(false);
        return;
    };

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as T);
        setData(docs);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error("Error fetching collection:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, loading, error };
}
