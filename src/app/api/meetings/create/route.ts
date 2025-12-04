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
    const { title, description, platform, meeting_url } = body

    if (!title || !platform) {
      return NextResponse.json(
        { error: 'Title and platform are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        title,
        description,
        platform,
        meeting_url,
        status: 'scheduled'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating meeting:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
