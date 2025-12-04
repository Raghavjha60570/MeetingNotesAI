'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Upload, FileAudio, Loader } from 'lucide-react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a valid audio file (MP3, WAV, M4A, WebM, or OGG)')
        return
      }

      // Validate file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB')
        return
      }

      setFile(selectedFile)
      setError('')

      // Auto-fill title if empty
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    setUploading(true)
    setProgress(0)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        return
      }

      // Create meeting record first
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          user_id: user.id,
          title,
          description,
          platform: 'manual_upload',
          status: 'in_progress'
        })
        .select()
        .single()

      if (meetingError) throw meetingError

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${meeting.id}/${Date.now()}.${fileExt}`

      setProgress(25)

      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      setProgress(50)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-files')
        .getPublicUrl(fileName)

      // Update meeting with audio file URL
      await supabase
        .from('meetings')
        .update({ audio_file_url: publicUrl })
        .eq('id', meeting.id)

      setProgress(75)

      // Start transcription process
      const formData = new FormData()
      formData.append('meeting_id', meeting.id)
      formData.append('audio_url', publicUrl)

      const response = await fetch('/api/transcript/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to start transcription')
      }

      setProgress(100)

      // Redirect to meeting page
      router.push(`/dashboard/meeting/${meeting.id}`)

    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Audio File</h1>
        <p className="mt-2 text-gray-600">
          Upload an audio recording to get automatic transcription and AI-generated summaries.
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* File Upload */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Audio File *
          </label>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              id="audio-file"
              disabled={uploading}
            />

            <label htmlFor="audio-file" className="cursor-pointer">
              {file ? (
                <div className="flex flex-col items-center">
                  <FileAudio className="w-16 h-16 text-primary-600 mb-4" />
                  <p className="text-lg font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Click to upload audio file
                  </p>
                  <p className="text-sm text-gray-500">
                    MP3, WAV, M4A, WebM, or OGG (max 100MB)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

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
                disabled={uploading}
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
                disabled={uploading}
              />
            </div>
          </div>
        </div>

        {/* Progress */}
        {uploading && (
          <div className="card">
            <div className="flex items-center mb-4">
              <Loader className="w-5 h-5 animate-spin mr-2" />
              <span className="font-medium">Processing your audio file...</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="mt-2 text-sm text-gray-600 text-center">
              {progress < 50 ? 'Uploading file...' :
               progress < 75 ? 'Processing audio...' :
               'Starting transcription...'}
            </div>
          </div>
        )}

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
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!file || !title || uploading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload & Transcribe'}
          </button>
        </div>
      </form>
    </div>
  )
}
