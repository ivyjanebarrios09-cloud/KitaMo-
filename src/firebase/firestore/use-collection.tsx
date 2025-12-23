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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface UseCollectionOptions {
  // Add any options here, e.g., for filtering or sorting
}

export function useCollection<T = DocumentData>(
  pathOrQuery: string | Query | null,
  options?: UseCollectionOptions
) {
  const db = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedQuery = useMemo(() => {
    if (!pathOrQuery) return null;
    if (typeof pathOrQuery === 'string') {
      // Ensure db is available before creating a collection reference
      if (!db) return null;
      return query(collection(db, pathOrQuery));
    }
    return pathOrQuery;
  }, [db, pathOrQuery]);

  useEffect(() => {
    if (!memoizedQuery) {
        setData([]);
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
        setError(null);
      },
      async (err: FirestoreError) => {
        if (err.code === 'permission-denied') {
          // The path for a query is not directly on the object, we have to get it from the internal _query object.
          // This is a bit of a hack, but it's the most reliable way to get the path for the error context.
          const path = (memoizedQuery as any)._query.path.segments.join('/');
          const permissionError = new FirestorePermissionError({
            path: path,
            operation: 'list',
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
          setError(permissionError);
        } else {
          console.error("Error fetching collection:", err);
          setError(err);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // The effect should only re-run if the query itself changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoizedQuery]);

  return { data, loading, error };
}
