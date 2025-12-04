import { createServerSupabaseClient } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

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

    // Update meeting status to completed
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .update({
        status: 'completed',
        end_time: new Date().toISOString()
      })
      .eq('id', meeting_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (meetingError) {
      console.error('Error updating meeting:', meetingError)
      return NextResponse.json({ error: meetingError.message }, { status: 500 })
    }

    // Trigger AI summary generation
    try {
      // This will be implemented when we add the AI summary functionality
      await generateAISummary(meeting_id)
    } catch (error) {
      console.error('Error generating AI summary:', error)
      // Don't fail the request if AI summary generation fails
    }

    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateAISummary(meetingId: string) {
  // This will be implemented later with OpenAI integration
  console.log(`Generating AI summary for meeting ${meetingId}`)
}
