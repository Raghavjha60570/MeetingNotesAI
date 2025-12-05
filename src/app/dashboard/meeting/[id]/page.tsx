import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { MeetingSummary } from '../../../../components/MeetingSummary';
import { TranscriptViewer } from '../../../../components/TranscriptViewer';

interface MeetingDetailPageProps {
  params: { id: string };
}

export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    notFound(); // Or redirect to sign-in
  }

  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('*, transcripts(timestamp_ms, text_chunk)')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();

  if (meetingError || !meeting) {
    console.error('Error fetching meeting:', meetingError);
    notFound();
  }

  const summaryData = meeting.summary ? JSON.parse(meeting.summary) : null;

  const handleRegenerateSummary = async () => {
    // This function will trigger an API route to regenerate the summary.
    // In a real application, you'd use client-side fetching for this.
    console.log(`Regenerating summary for meeting: ${meeting.id}`);
    // Example: await fetch('/api/meetings/generate-summary', { method: 'POST', body: JSON.stringify({ meetingId: meeting.id }) });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold mb-4">{meeting.title || 'Untitled Meeting'}</h1>
      <p className="text-gray-400 text-lg">Started: {format(new Date(meeting.started_at), 'PPpp')}</p>
      {meeting.ended_at && (
        <p className="text-gray-400 text-lg">Ended: {format(new Date(meeting.ended_at), 'PPpp')}</p>
      )}

      {summaryData ? (
        <div>
          <MeetingSummary
            summary={summaryData.summary}
            bulletPoints={summaryData.bulletPoints}
            actionItems={summaryData.actionItems}
            importantQuotes={summaryData.importantQuotes}
          />
          <button
            onClick={handleRegenerateSummary}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Regenerate Summary
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
          <p className="text-lg">No summary available yet. It will be generated after the meeting ends.</p>
        </div>
      )}

      {meeting.transcripts && meeting.transcripts.length > 0 ? (
        <TranscriptViewer transcript={meeting.transcripts.sort((a, b) => a.timestamp_ms - b.timestamp_ms)} />
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
          <p className="text-lg">No transcript available yet. Start recording a meeting to generate a transcript.</p>
        </div>
      )}
    </div>
  );
}
