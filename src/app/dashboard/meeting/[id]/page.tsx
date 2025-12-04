'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AudioWebSocketClient } from '@/lib/websocket'
import { Mic, MicOff, Square, FileText, Clock, Users } from 'lucide-react'
import { Database } from '@/types/database'

type Meeting = Database['public']['Tables']['meetings']['Row']
type TranscriptChunk = Database['public']['Tables']['transcript_chunks']['Row']
type AISummary = Database['public']['Tables']['ai_summaries']['Row']

export default function MeetingDetail() {
  const params = useParams()
  const router = useRouter()
  const meetingId = params.id as string

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [transcripts, setTranscripts] = useState<TranscriptChunk[]>([])
  const [summaries, setSummaries] = useState<AISummary[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wsClient, setWsClient] = useState<AudioWebSocketClient | null>(null)

  useEffect(() => {
    loadMeetingData()
  }, [meetingId])

  const loadMeetingData = async () => {
    try {
      // Load meeting details
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single()

      if (meetingError) throw meetingError
      setMeeting(meetingData)

      // Load transcripts
      const { data: transcriptData, error: transcriptError } = await supabase
        .from('transcript_chunks')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('start_time', { ascending: true })

      if (!transcriptError) {
        setTranscripts(transcriptData || [])
      }

      // Load AI summaries
      const { data: summaryData, error: summaryError } = await supabase
        .from('ai_summaries')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false })

      if (!summaryError) {
        setSummaries(summaryData || [])
      }

      // Set recording state based on meeting status
      setIsRecording(meetingData.status === 'in_progress')

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const client = new AudioWebSocketClient(
        meetingId,
        (text, startTime, endTime) => {
          // Add new transcript to the list
          const newTranscript: TranscriptChunk = {
            id: Date.now().toString(),
            meeting_id: meetingId,
            text,
            start_time: startTime,
            end_time: endTime,
            status: 'completed',
            created_at: new Date().toISOString()
          }
          setTranscripts(prev => [...prev, newTranscript])
        },
        (error) => {
          setError(error)
        }
      )

      await client.connect()
      await client.startRecording()

      setWsClient(client)
      setIsRecording(true)

      // Update meeting status
      await supabase
        .from('meetings')
        .update({ status: 'in_progress' })
        .eq('id', meetingId)

    } catch (error: any) {
      setError(error.message)
    }
  }

  const stopRecording = () => {
    if (wsClient) {
      wsClient.stopRecording()
      setIsRecording(false)
    }
  }

  const endMeeting = async () => {
    if (wsClient) {
      wsClient.endMeeting()
      setWsClient(null)
      setIsRecording(false)
    }

    // Update meeting status and trigger AI summary generation
    try {
      await fetch('/api/meetings/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_id: meetingId })
      })

      // Reload data to get updated status
      loadMeetingData()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const generateSummary = async () => {
    try {
      // This will call our AI summary generation endpoint (to be implemented)
      const response = await fetch('/api/meetings/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_id: meetingId })
      })

      if (response.ok) {
        loadMeetingData() // Reload to get new summary
      }
    } catch (error: any) {
      setError(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Meeting not found</h2>
        <p className="text-gray-600">The meeting you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{meeting.title}</h1>
          {meeting.description && (
            <p className="mt-2 text-gray-600">{meeting.description}</p>
          )}
          <div className="flex items-center mt-4 space-x-4 text-sm text-gray-500">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              meeting.status === 'in_progress' ? 'bg-green-100 text-green-800' :
              meeting.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {meeting.status.replace('_', ' ')}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {meeting.start_time ? new Date(meeting.start_time).toLocaleString() : 'Not started'}
            </span>
            {meeting.participant_count > 0 && (
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {meeting.participant_count} participants
              </span>
            )}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex gap-3">
          {meeting.status === 'scheduled' && (
            <button
              onClick={startRecording}
              className="btn-primary flex items-center"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </button>
          )}

          {meeting.status === 'in_progress' && (
            <>
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"
              >
                <Square className="w-4 h-4 mr-2" />
                Pause
              </button>
              <button
                onClick={endMeeting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                <Square className="w-4 h-4 mr-2" />
                End Meeting
              </button>
            </>
          )}

          {meeting.status === 'completed' && summaries.length === 0 && (
            <button
              onClick={generateSummary}
              className="btn-primary flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Summary
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <p className="text-green-800 font-medium">Recording in progress...</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transcript */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Live Transcript</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transcripts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {isRecording ? 'Listening...' : 'No transcript available yet'}
              </p>
            ) : (
              transcripts.map((chunk) => (
                <div key={chunk.id} className="border-l-4 border-primary-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm text-gray-500">{chunk.start_time}</span>
                    {chunk.speaker_name && (
                      <span className="text-sm font-medium text-primary-600">
                        {chunk.speaker_name}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900">{chunk.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Summary */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">AI Summary</h2>
          {summaries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {meeting.status === 'completed' ? 'Summary not generated yet' : 'Summary will appear after the meeting ends'}
            </p>
          ) : (
            <div className="space-y-4">
              {summaries.map((summary) => (
                <div key={summary.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2 capitalize">
                    {summary.summary_type.replace('_', ' ')}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{summary.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Generated {new Date(summary.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
