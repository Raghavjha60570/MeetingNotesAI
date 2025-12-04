'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Video, Monitor, Upload } from 'lucide-react'

export default function NewMeeting() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [platform, setPlatform] = useState<'zoom' | 'google_meet' | 'manual_upload'>('zoom')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        return
      }

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          user_id: user.id,
          title,
          description,
          platform,
          meeting_url: meetingUrl,
          status: 'scheduled'
        })
        .select()
        .single()

      if (error) {
        setError(error.message)
      } else {
        router.push(`/dashboard/meeting/${data.id}`)
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const platforms = [
    {
      id: 'zoom' as const,
      name: 'Zoom',
      icon: Video,
      description: 'Join a Zoom meeting for live transcription',
      color: 'bg-blue-500'
    },
    {
      id: 'google_meet' as const,
      name: 'Google Meet',
      icon: Monitor,
      description: 'Join a Google Meet session',
      color: 'bg-green-500'
    },
    {
      id: 'manual_upload' as const,
      name: 'Local Recording',
      icon: Upload,
      description: 'Use microphone for local recording',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Meeting</h1>
        <p className="mt-2 text-gray-600">
          Set up a new meeting session for transcription and analysis.
        </p>
      </div>

      <form onSubmit={handleCreateMeeting} className="space-y-6">
        {/* Meeting Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Meeting Details</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter meeting title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional meeting description"
              />
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Meeting Platform</h2>

          <div className="grid gap-4 md:grid-cols-3">
            {platforms.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                    platform === p.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 ${p.color} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{p.name}</h3>
                  <p className="text-sm text-gray-600">{p.description}</p>
                </div>
              )
            })}
          </div>

          {(platform === 'zoom' || platform === 'google_meet') && (
            <div className="mt-4">
              <label htmlFor="meetingUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Meeting URL *
              </label>
              <input
                type="url"
                id="meetingUrl"
                required
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={`Enter ${platform === 'zoom' ? 'Zoom' : 'Google Meet'} meeting URL`}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Meeting'}
          </button>
        </div>
      </form>
    </div>
  )
}
