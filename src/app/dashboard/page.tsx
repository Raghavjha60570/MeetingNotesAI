import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // This should ideally be handled by middleware, but a fallback is good.
    return <p>Please sign in to view your dashboard.</p>;
  }

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('id, title, started_at, ended_at')
    .eq('user_id', session.user.id)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching meetings:', error);
    return <p className="text-red-500">Error loading meetings.</p>;
  }

  const calculateDuration = (startedAt: string, endedAt: string | null) => {
    if (!endedAt) return 'Ongoing';
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diffMs = end.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Meetings</h1>
      {meetings && meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{meeting.title || 'Untitled Meeting'}</h2>
                <p className="text-gray-400 text-sm mb-1">Date: {format(new Date(meeting.started_at), 'PPP')}</p>
                <p className="text-gray-400 text-sm mb-4">Duration: {calculateDuration(meeting.started_at, meeting.ended_at)}</p>
              </div>
              <Link href={`/dashboard/meeting/${meeting.id}`}
                    className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-center">
                View Meeting
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No meetings recorded yet. Start a new meeting to see your transcripts and summaries here!</p>
      )}
    </div>
  );
}
