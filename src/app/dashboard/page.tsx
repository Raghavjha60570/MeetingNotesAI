import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Plus, Play, FileText, Clock, Mic } from 'lucide-react'
import { Database } from '@/types/database'

type Meeting = Database['public']['Tables']['meetings']['Row']

async function getMeetings(userId: string): Promise<Meeting[]> {
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching meetings:', error)
    return []
  }

  return data || []
}

export default async function Dashboard() {
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('Dashboard page: No user found')
    return null // This shouldn't happen due to middleware
  }

  console.log('Dashboard page: User authenticated:', user.email)
  console.log('Dashboard page: Skipping meetings fetch until schema is applied')
  const meetings = [] // Temporarily empty until schema is applied
  console.log('Dashboard page: Using empty meetings array for now')

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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Meetings</h1>
          <p className="mt-2 text-gray-600">
            Manage your meeting recordings and transcripts
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/dashboard/new-meeting"
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

      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Mic className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
          <p className="text-gray-600 mb-6">
            Start by creating your first meeting or uploading an audio file.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard/new-meeting" className="btn-primary">
              Create Meeting
            </Link>
            <Link href="/upload" className="btn-secondary">
              Upload Audio
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
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
                {meeting.created_at ? new Date(meeting.created_at).toLocaleDateString() : 'Unknown date'}
                {meeting.duration && (
                  <span className="ml-2">• {meeting.duration}</span>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/meeting/${meeting.id}`}
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
      )}
    </div>
  )
}
