'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-6">
            We encountered an issue during the authentication process.
            {error && (
              <>
                <br />
                <span className="text-sm text-red-600 mt-2 block">Error: {error}</span>
              </>
            )}
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
