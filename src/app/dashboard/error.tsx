'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Error
          </h2>

          <p className="text-gray-600 mb-6">
            We encountered an issue loading this dashboard page.
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Error Details:
              </p>
              <p className="text-sm font-mono text-gray-700">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={reset}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try again
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Return to dashboard home
            </button>

            <button
              onClick={() => router.push('/login')}
              className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
