'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function InvoicesErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Invoices Page Error:', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">Failed to load invoices</h3>
          <p className="mt-1 text-sm text-red-700">{error.message}</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={reset}
              className="rounded px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="rounded px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Go back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
