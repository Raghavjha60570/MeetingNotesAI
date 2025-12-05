import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Live Meeting Notes</h1>
      <p className="text-lg mb-8 text-center">
        Your ultimate tool for real-time transcription and summarization of Google Meet calls.
      </p>
      <div className="flex space-x-4">
        <Link href="/auth/signin" className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg hover:bg-blue-700">
          Sign In
        </Link>
        <Link href="/auth/signup" className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md text-lg hover:bg-blue-50">
          Sign Up
        </Link>
      </div>
    </main>
  );
}
