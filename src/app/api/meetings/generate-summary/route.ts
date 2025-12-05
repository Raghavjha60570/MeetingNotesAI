import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { openai } from '../../../../src/lib/openai';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseServiceRole = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: NextRequest) {
  try {
    const { meetingId } = await req.json();

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    // 1. Query full transcript from Supabase
    const { data: transcripts, error: transcriptError } = await supabaseServiceRole
      .from('transcripts')
      .select('text_chunk')
      .eq('meeting_id', meetingId)
      .order('timestamp_ms', { ascending: true });

    if (transcriptError) throw transcriptError;

    const fullTranscript = transcripts.map(t => t.text_chunk).join(' ');

    if (!fullTranscript.trim()) {
      return NextResponse.json({ message: 'No transcript available for summarization.' }, { status: 200 });
    }

    // 2. Send to OpenAI API for summary generation
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini as requested for optional upgrade
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes meeting transcripts. Provide a concise summary, key bullet points, action items, and important quotes from the meeting.",
        },
        {
          role: "user",
          content: `Please summarize the following meeting transcript, providing a concise summary, 3-5 key bullet points, any action items, and 2-3 important quotes:\n\nTranscript: ${fullTranscript}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiResponseContent = completion.choices[0]?.message?.content;

    if (!aiResponseContent) {
      throw new Error('OpenAI did not return a summary.');
    }

    // Parse the AI response into structured data
    const summaryRegex = /Summary:\\s*([\\s\\S]*?)(?:\\n\\nKey Points:|$)/i;
    const bulletPointsRegex = /Key Points:\\s*(?:-|\\*|\\d\\.)\\s*([\\s\\S]*?)(?:\\n\\nAction Items:|$)/i;
    const actionItemsRegex = /Action Items:\\s*(?:-|\\*|\\d\\.)\\s*([\\s\\S]*?)(?:\\n\\nImportant Quotes:|$)/i;
    const quotesRegex = /Important Quotes:\\s*([\\s\\S]*)/i;

    const extractPoints = (text: string) => {
      return text.split(/\n(?:-|\*|\d\.)\s*/).filter(Boolean).map(s => s.trim());
    };

    const summaryMatch = aiResponseContent.match(summaryRegex);
    const bulletPointsMatch = aiResponseContent.match(bulletPointsRegex);
    const actionItemsMatch = aiResponseContent.match(actionItemsRegex);
    const quotesMatch = aiResponseContent.match(quotesRegex);

    const parsedSummary = {
      summary: summaryMatch ? summaryMatch[1].trim() : 'No summary generated.',
      bulletPoints: bulletPointsMatch ? extractPoints(bulletPointsMatch[1]) : [],
      actionItems: actionItemsMatch ? extractPoints(actionItemsMatch[1]) : [],
      importantQuotes: quotesMatch ? extractPoints(quotesMatch[1]) : [],
    };

    // 3. Save to meetings.summary
    const { error: updateError } = await supabaseServiceRole
      .from('meetings')
      .update({ summary: JSON.stringify(parsedSummary) })
      .eq('id', meetingId);

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Summary generated and saved successfully.', summary: parsedSummary }, { status: 200 });
  } catch (error: any) {
    console.error('AI Summary API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const config = {
  runtime: 'edge',
};
