'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Mic, MicOff, Square, FileText, Clock, Users, ArrowLeft } from 'lucide-react'

// Demo transcript data
const demoTranscript = [
  {
    id: '1',
    start_time: '00:00:15',
    end_time: '00:00:28',
    text: 'Good morning everyone! Welcome to our team standup meeting.',
    speaker_name: 'John (Host)',
    confidence: 0.95
  },
  {
    id: '2',
    start_time: '00:00:30',
    end_time: '00:00:45',
    text: 'I worked on the authentication system yesterday and made good progress on the login flow.',
    speaker_name: 'Sarah',
    confidence: 0.92
  },
  {
    id: '3',
    start_time: '00:00:47',
    end_time: '00:01:02',
    text: 'That sounds great! I was focusing on the dashboard UI and implemented the meeting cards layout.',
    speaker_name: 'Mike',
    confidence: 0.89
  },
  {
    id: '4',
    start_time: '00:01:05',
    end_time: '00:01:18',
    text: 'Perfect! Today I plan to work on the transcription service integration with OpenAI.',
    speaker_name: 'John (Host)',
    confidence: 0.94
  }
]

// Demo AI summaries
const demoSummaries = [
  {
    id: '1',
    summary_type: 'full_summary',
    content: 'This was a productive team standup meeting where team members discussed their progress on the Live Meeting Notes project. John is working on authentication, Sarah completed the login flow, and Mike finished the dashboard UI. The team is making good progress on integrating OpenAI for transcription services.'
  },
  {
    id: '2',
    summary_type: 'key_points',
    content: '• Authentication system progress by John\n• Login flow completion by Sarah\n• Dashboard UI implementation by Mike\n• OpenAI transcription integration planned'
  },
  {
    id: '3',
    summary_type: 'action_items',
    content: '• John to continue authentication system work\n• Sarah to assist with UI refinements\n• Mike to help with OpenAI integration\n• Team to test transcription service by end of week'
  }
]

const demoMeetings: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Team Standup Meeting',
    description: 'Daily standup with the development team',
    platform: 'zoom',
    status: 'completed',
    start_time: '2024-12-04T10:00:00Z',
    end_time: '2024-12-04T10:30:00Z',
    duration: '30 minutes',
    participant_count: 3
  },
  '2': {
    id: '2',
    title: 'Client Presentation',
    description: 'Product demo for potential client',
    platform: 'google_meet',
    status: 'in_progress',
    start_time: '2024-12-04T14:00:00Z',
    participant_count: 5
  },
  '3': {
    id: '3',
    title: 'Recorded Interview',
    description: 'Job interview recording for analysis',
    platform: 'manual_upload',
    status: 'scheduled'
  }
}

export default function DemoMeetingDetail() {
  const params = useParams()
  const meetingId = params.id as string
  const meeting = demoMeetings[meetingId]

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Meeting Not Found</h1>
          <Link href="/demo" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Mic className="w-8 h-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Live Notes</span>
              </Link>
              <span className="ml-4 text-sm text-yellow-500 bg-yellow-100 px-2 py-1 rounded">DEMO MODE</span>
            </div>
            <div className="flex items-center">
              <Link href="/demo" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4">
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
                  {meeting.start_time ? new Date(meeting.start_time).toLocaleString('en-US') : 'Not started'}
                </span>
                {meeting.participant_count && (
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {meeting.participant_count} participants
                  </span>
                )}
              </div>
            </div>

            {/* Recording Controls (Demo) */}
            <div className="flex gap-3">
              {meeting.status === 'scheduled' && (
                <button className="btn-primary flex items-center">
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </button>
              )}

              {meeting.status === 'in_progress' && (
                <>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center">
                    <Square className="w-4 h-4 mr-2" />
                    Pause
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center">
                    <Square className="w-4 h-4 mr-2" />
                    End Meeting
                  </button>
                </>
              )}

              {meeting.status === 'completed' && demoSummaries.length === 0 && (
                <button className="btn-primary flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Summary
                </button>
              )}
            </div>
          </div>

          {/* Recording Indicator */}
          {meeting.status === 'in_progress' && (
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
                {demoTranscript.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {meeting.status === 'in_progress' ? 'Listening...' : 'No transcript available yet'}
                  </p>
                ) : (
                  demoTranscript.map((chunk) => (
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
              {demoSummaries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {meeting.status === 'completed' ? 'Summary not generated yet' : 'Summary will appear after the meeting ends'}
                </p>
              ) : (
                <div className="space-y-4">
                  {demoSummaries.map((summary) => (
                    <div key={summary.id} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2 capitalize">
                        {summary.summary_type.replace('_', ' ')}
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{summary.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Generated {new Date().toLocaleString('en-US')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Demo Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🎭 Demo Mode Features</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800">Real-time Transcription</h4>
                <p className="text-blue-700">Shows how live audio becomes text with timestamps and speaker identification</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800">AI-Powered Summaries</h4>
                <p className="text-blue-700">Automatically generates full summaries, key points, and action items</p>
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Meeting Controls</h4>
                <p className="text-blue-700">Start, pause, and end recordings with live status indicators</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
