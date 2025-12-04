import { createServerSupabaseClient } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  if (error) {
    console.error('Auth error:', error, error_description)
    return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error_description || error)}`)
  }

  if (code) {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent('Failed to confirm email')}`)
    }

    // Successfully confirmed - redirect to dashboard
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  // No code or error - redirect to sign in
  return NextResponse.redirect(`${origin}/auth/signin`)
}
