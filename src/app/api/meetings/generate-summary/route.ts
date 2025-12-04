import { createServerSupabaseClient } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { meeting_id } = body

    if (!meeting_id) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    // Verify user owns this meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meeting_id)
      .eq('user_id', user.id)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // Get all transcript chunks for this meeting
    const { data: transcripts, error: transcriptError } = await supabase
      .from('transcript_chunks')
      .select('*')
      .eq('meeting_id', meeting_id)
      .order('start_time', { ascending: true })

    if (transcriptError) {
      console.error('Error fetching transcripts:', transcriptError)
      return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 })
    }

    if (!transcripts || transcripts.length === 0) {
      return NextResponse.json({ error: 'No transcripts available for summary generation' }, { status: 400 })
    }

    // Combine all transcript text
    const fullTranscript = transcripts
      .map(chunk => chunk.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Generate different types of summaries
    const summaryTypes = [
      {
        type: 'full_summary',
        prompt: `Please provide a comprehensive summary of the following meeting transcript. Include the main topics discussed, key decisions made, and important outcomes. Be concise but thorough:

${fullTranscript}`
      },
      {
        type: 'key_points',
        prompt: `Extract the key points and main takeaways from this meeting transcript. Focus on the most important information and decisions:

${fullTranscript}`
      },
      {
        type: 'action_items',
        prompt: `Identify all action items, tasks, and follow-ups mentioned in this meeting transcript. Include who is responsible for each item and any deadlines mentioned:

${fullTranscript}`
      },
      {
        type: 'highlights',
        prompt: `Extract the most important highlights and memorable moments from this meeting transcript. Focus on significant statements, decisions, and key discussions:

${fullTranscript}`
      }
    ]

    const generatedSummaries = []

    for (const summaryType of summaryTypes) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert meeting assistant. Provide clear, well-structured summaries that capture the essence of the discussion.'
            },
            {
              role: 'user',
              content: summaryType.prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })

        const content = completion.choices[0]?.message?.content?.trim()

        if (content) {
          const { error: insertError } = await supabase
            .from('ai_summaries')
            .insert({
              meeting_id,
              summary_type: summaryType.type,
              content,
              model_used: 'gpt-4'
            })

          if (insertError) {
            console.error(`Error saving ${summaryType.type}:`, insertError)
          } else {
            generatedSummaries.push({
              type: summaryType.type,
              content
            })
          }
        }
      } catch (error) {
        console.error(`Error generating ${summaryType.type}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      summaries_generated: generatedSummaries.length,
      summaries: generatedSummaries
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
