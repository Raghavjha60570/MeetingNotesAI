'use client'

import Link from 'next/link'
import { Mic, FileAudio, Settings, LogOut, Plus, Play, FileText, Clock } from 'lucide-react'

// Demo data to show the dashboard functionality
const demoMeetings = [
  {
    id: '1',
    title: 'Team Standup Meeting',
    description: 'Daily standup with the development team',
    platform: 'zoom' as const,
    status: 'completed' as const,
    created_at: '2024-12-04T10:00:00Z',
    duration: '30 minutes'
  },
  {
    id: '2',
    title: 'Client Presentation',
    description: 'Product demo for potential client',
    platform: 'google_meet' as const,
    status: 'in_progress' as const,
    created_at: '2024-12-04T14:00:00Z',
    duration: null
  },
  {
    id: '3',
    title: 'Recorded Interview',
    description: 'Job interview recording for analysis',
    platform: 'manual_upload' as const,
    status: 'scheduled' as const,
    created_at: '2024-12-04T16:00:00Z',
    duration: null
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'zoom':
      return '🎥'
    case 'google_meet':
      return '📹'
    case 'manual_upload':
      return '📁'
    default:
      return '🎙️'
  }
}

export default function DemoDashboard() {
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
              <span className="ml-4 text-sm text-gray-500 bg-yellow-100 px-2 py-1 rounded">DEMO MODE</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/demo"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Upload
              </Link>
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Meetings</h1>
              <p className="mt-2 text-gray-600">
                Manage your meeting recordings and transcripts
              </p>
              <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded">
                🚀 <strong>Demo Mode:</strong> This shows how the dashboard will look with real data
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/demo/new-meeting"
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Meeting
              </Link>
              <Link
                href="/upload"
                className="btn-secondary flex items-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Upload Audio
              </Link>
            </div>
          </div>

          {/* Demo Meetings Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demoMeetings.map((meeting) => (
              <div key={meeting.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getPlatformIcon(meeting.platform)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {meeting.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {meeting.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {meeting.description}
                  </p>
                )}

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(meeting.created_at).toLocaleDateString('en-US')}
                  {meeting.duration && (
                    <span className="ml-2">• {meeting.duration}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/demo/meeting/${meeting.id}`}
                    className="flex-1 btn-primary text-center text-sm py-2"
                  >
                    View Details
                  </Link>
                  {meeting.status === 'in_progress' && (
                    <button className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Features Showcase */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Live Meeting Notes Features</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-time Transcription</h3>
                <p className="text-gray-600 text-sm">Live audio transcription during meetings using OpenAI Whisper</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileAudio className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">File Upload</h3>
                <p className="text-gray-600 text-sm">Upload existing audio recordings for automatic transcription</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Summaries</h3>
                <p className="text-gray-600 text-sm">Generate intelligent summaries, action items, and highlights</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
                <p className="text-gray-600 text-sm">Complete meeting management and analytics interface</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">🔧 Setup Required</h4>
                <p className="text-yellow-700 text-sm mb-3">
                  To enable full functionality, you need to:
                </p>
                <ol className="text-left text-yellow-700 text-sm space-y-1 max-w-md mx-auto">
                  <li>1. Apply the database schema to Supabase</li>
                  <li>2. Configure authentication settings</li>
                  <li>3. Set up OpenAI API key</li>
                </ol>
                <Link
                  href="/admin"
                  className="mt-3 inline-block bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700"
                >
                  Apply Database Schema
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
