import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">404 - Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="px-6 py-2 bg-[#139D46] text-white rounded-md hover:bg-[#0f8038] transition-colors">
        Return Home
      </Link>
    </div>
  )
}
