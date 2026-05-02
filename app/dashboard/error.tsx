'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring
    console.error('Dashboard Error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <div className="mx-auto w-full max-w-md rounded-lg border border-[var(--ink-lighter)] bg-[var(--bg-surface)] p-8 text-center shadow-sm">
        <div className="mb-6">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[var(--ink)]">
            Something went wrong!
          </h2>
        </div>

        <p className="mb-6 text-sm text-[var(--ink-soft)]">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {error.digest && (
          <p className="mb-6 font-mono text-xs text-[var(--ink-lighter)]">
            Error ID: {error.digest}
          </p>
        )}

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="block rounded-lg border border-[var(--ink-lighter)] px-4 py-2.5 font-medium text-[var(--ink)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Back to dashboard
          </Link>
        </div>

        <p className="mt-6 text-xs text-[var(--ink-lighter)]">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
