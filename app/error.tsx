'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Något gick fel</h1>
        <p className="text-gray-700 mb-6">Sidan kunde inte laddas. Försök igen om en stund.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          Försök igen
        </button>
      </div>
    </div>
  );
}
