import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get user by email
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()

    if (getUserError) {
      console.error('Error listing users:', getUserError)
      return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user to confirmed
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true
    })

    if (error) {
      console.error('Error confirming user:', error)
      return NextResponse.json({ error: 'Failed to confirm user' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been confirmed`,
      user: {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at
      }
    })

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
