import Link from 'next/link'
import { Mic, FileAudio, Users, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Live Meeting Notes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered meeting transcription and note-taking. Join meetings, get real-time transcripts,
            and automatic summaries with key insights and action items.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link href="/upload" className="btn-secondary text-lg px-8 py-3">
              Upload Audio
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="card text-center">
            <Mic className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Live Transcription</h3>
            <p className="text-gray-600">
              Join Zoom or Google Meet meetings and get real-time transcription
            </p>
          </div>

          <div className="card text-center">
            <Zap className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Summaries</h3>
            <p className="text-gray-600">
              Automatic generation of meeting summaries, action items, and key highlights
            </p>
          </div>

          <div className="card text-center">
            <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-gray-600">
              Share meeting notes and transcripts with your team members
            </p>
          </div>

          <div className="card text-center">
            <FileAudio className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">File Upload</h3>
            <p className="text-gray-600">
              Upload existing audio recordings for transcription and analysis
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="card max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Join Meeting</h3>
              <p className="text-gray-600">
                Start a meeting session and our AI bot joins to capture audio in real-time
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Transcription</h3>
              <p className="text-gray-600">
                Audio is transcribed in real-time using advanced AI models
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Generate summaries, action items, and key insights automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
