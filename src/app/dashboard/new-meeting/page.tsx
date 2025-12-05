'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NewMeetingPage() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleStartMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("User not authenticated. Please sign in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/meet-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if needed, though middleware should handle session
        },
        body: JSON.stringify({ event: 'meeting_start', userId: user.id, title }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start meeting');
      }

      router.push(`/dashboard/meeting/${data.meetingId}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Start a New Meeting</h1>
      <form onSubmit={handleStartMeeting} className="space-y-6 max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">Meeting Title (Optional)</label>
          <input
            type="text"
            id="title"
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Team Sync Meeting"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Starting...' : 'Start Meeting Now'}
        </button>
      </form>
    </div>
  );
}
