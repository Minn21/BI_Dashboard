import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-5 text-center">
      <h1 className="text-4xl font-bold text-gray-100 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-400 mb-8">The page you are looking for does not exist.</p>
      <Link 
        href="/"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
