import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Welcome to Qibla Finder</h1>
      <Link
  href="/qibla"
  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
>
  Go to Qibla Finder
</Link>

    </div>
  );
}
