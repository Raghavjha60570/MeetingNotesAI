import { NextRequest } from 'next/server'
import { WebSocket } from 'ws'
import { createServerSupabaseClient } from '@/lib/auth'
import OpenAI from 'openai'

// Store active WebSocket connections
const activeConnections = new Map<string, WebSocket>()
export const runtime = 'nodejs';

// OpenAI client for transcription
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function GET(request: NextRequest) {
  // This is a WebSocket upgrade handler
  // In Next.js, we need to handle WebSocket connections differently
  // For now, we'll return an error and implement WebSocket handling separately

  const meetingId = request.nextUrl.searchParams.get('meeting_id')
  if (!meetingId) {
    return new Response('Meeting ID is required', { status: 400 })
  }

  // In a production setup, you'd want to upgrade to WebSocket here
  // For this MVP, we'll use Server-Sent Events or polling instead

  return new Response('WebSocket endpoint - implementation in progress', {
    status: 501,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

// Function to handle WebSocket messages (to be called from WebSocket server)
export async function handleWebSocketMessage(ws: WebSocket, message: any, meetingId: string) {
  try {
    const supabase = createServerSupabaseClient()

    if (message.type === 'audio_chunk') {
      // Process audio chunk for transcription
      const audioBuffer = Buffer.from(message.audio, 'base64')

      // Transcribe using OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
        model: 'whisper-1',
        response_format: 'json',
      })

      if (transcription.text) {
        // Save transcript chunk to database
        const { error } = await supabase
          .from('transcript_chunks')
          .insert({
            meeting_id: meetingId,
            text: transcription.text,
            start_time: message.startTime || '00:00:00',
            end_time: message.endTime || '00:00:05',
            status: 'completed'
          })

        if (error) {
          console.error('Error saving transcript:', error)
        }

        // Send transcription back to client
        ws.send(JSON.stringify({
          type: 'transcription',
          text: transcription.text,
          startTime: message.startTime,
          endTime: message.endTime
        }))
      }
    } else if (message.type === 'start_meeting') {
      // Update meeting status to in_progress
      await supabase
        .from('meetings')
        .update({
          status: 'in_progress',
          start_time: new Date().toISOString()
        })
        .eq('id', meetingId)

      activeConnections.set(meetingId, ws)
    } else if (message.type === 'end_meeting') {
      // Update meeting status to completed
      await supabase
        .from('meetings')
        .update({
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', meetingId)

      activeConnections.delete(meetingId)
      ws.close()
    }
  } catch (error) {
    console.error('Error handling WebSocket message:', error)
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process audio chunk'
    }))
  }
}
