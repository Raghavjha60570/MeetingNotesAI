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

    const formData = await request.formData()
    const meetingId = formData.get('meeting_id') as string
    const audioUrl = formData.get('audio_url') as string

    if (!meetingId || !audioUrl) {
      return NextResponse.json(
        { error: 'Meeting ID and audio URL are required' },
        { status: 400 }
      )
    }

    // Verify user owns this meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .eq('user_id', user.id)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // Download audio file
    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      throw new Error('Failed to download audio file')
    }

    const audioBuffer = await audioResponse.arrayBuffer()

    // Create a File-like object for OpenAI
    const audioFile = new File([audioBuffer], 'audio.mp3', {
      type: 'audio/mpeg'
    })

    try {
      // Transcribe the entire audio file
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment']
      })

      // Save transcription segments to database
      if (transcription.segments) {
        const transcriptChunks = transcription.segments.map((segment: any) => ({
          meeting_id: meetingId,
          text: segment.text,
          start_time: formatTime(segment.start),
          end_time: formatTime(segment.end),
          confidence: segment.confidence || null,
          status: 'completed' as const
        }))

        const { error: insertError } = await supabase
          .from('transcript_chunks')
          .insert(transcriptChunks)

        if (insertError) {
          console.error('Error saving transcript chunks:', insertError)
          throw new Error('Failed to save transcription')
        }
      }

      // Update meeting status to completed
      await supabase
        .from('meetings')
        .update({
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', meetingId)

      // Trigger AI summary generation
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/meetings/generate-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meeting_id: meetingId })
        })
      } catch (summaryError) {
        console.error('Error triggering summary generation:', summaryError)
        // Don't fail the request if summary generation fails
      }

      return NextResponse.json({
        success: true,
        transcript_segments: transcription.segments?.length || 0,
        full_transcript: transcription.text
      })

    } catch (transcriptionError: any) {
      console.error('Transcription error:', transcriptionError)

      // Update meeting status to failed
      await supabase
        .from('meetings')
        .update({ status: 'cancelled' })
        .eq('id', meetingId)

      throw new Error('Failed to transcribe audio: ' + transcriptionError.message)
    }

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
