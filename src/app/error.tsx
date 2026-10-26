'use client';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
          <p className="text-gray-600 mb-2 max-w-md">We encountered an unexpected error while loading this page.</p>
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-8 max-w-md text-left text-sm font-mono overflow-auto border border-red-200">
             {error?.message || "Unknown error"}
             <br/><br/>
             {error?.stack}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => reset()}
              className="px-6 py-2 bg-[#139D46] text-white rounded-md hover:bg-[#0f8038] transition-colors"
            >
              Try again
            </button>
            <Link href="/" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
