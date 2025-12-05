import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseServiceRole = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: NextRequest) {
  try {
    const { event, userId, meetingId, title } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    switch (event) {
      case 'meeting_start': {
        const newMeetingId = meetingId || uuidv4();
        const { data, error } = await supabaseServiceRole.from('meetings').insert({
          id: newMeetingId,
          user_id: userId,
          title: title || 'Untitled Meeting',
          started_at: new Date().toISOString(),
        }).select();

        if (error) throw error;
        return NextResponse.json({ message: 'Meeting started', meetingId: newMeetingId, data: data[0] }, { status: 200 });
      }
      case 'meeting_end': {
        if (!meetingId) {
          return NextResponse.json({ error: 'Meeting ID is required for ending a meeting' }, { status: 400 });
        }
        const { data, error } = await supabaseServiceRole.from('meetings').update({
          ended_at: new Date().toISOString(),
        }).eq('id', meetingId).eq('user_id', userId).select();

        if (error) throw error;

        // Trigger AI summary generation (this could be an Edge Function webhook call)
        // For now, we'll log it and assume an external process handles it.
        console.log(`Triggering AI summary for meeting: ${meetingId}`);
        // In a real application, you might call a Supabase Edge Function or another API here.
        // await fetch(`${req.nextUrl.origin}/api/meetings/generate-summary`, { method: 'POST', body: JSON.stringify({ meetingId }) });

        return NextResponse.json({ message: 'Meeting ended', data: data[0] }, { status: 200 });
      }
      default: {
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
      }
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const config = {
  runtime: 'edge',
};
