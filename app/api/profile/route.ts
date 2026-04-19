import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { checkRateLimit, rateLimitResponse } from '@/lib/utils/rate-limit'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { data: null, error: { message: 'Unauthorized' } },
      { status: 401 }
    )
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      'id, email, full_name, role, department, status, org_id, avatar_url, phone, bio, company, created_at, updated_at'
    )
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json(
      { data: null, error: { message: error.message } },
      { status: 400 }
    )
  }

  return NextResponse.json({ data: profile, error: null })
}

export async function PUT(req: NextRequest) {
  const rl = await checkRateLimit(req, 'api')
  if (!rl.success) return rateLimitResponse(rl.remaining, rl.reset)

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { data: null, error: { message: 'Unauthorized' } },
      { status: 401 }
    )
  }

  const body = await req.json()
  const { full_name, phone, bio, company, avatar_url } = body

  // Validate full_name if provided
  if (
    full_name !== undefined &&
    (typeof full_name !== 'string' || full_name.trim().length < 1)
  ) {
    return NextResponse.json(
      { data: null, error: { message: 'Name is required' } },
      { status: 400 }
    )
  }

  // Validate phone length if provided
  if (phone !== undefined && phone !== null && typeof phone === 'string' && phone.length > 30) {
    return NextResponse.json(
      { data: null, error: { message: 'Phone number is too long' } },
      { status: 400 }
    )
  }

  // Validate bio length if provided
  if (bio !== undefined && bio !== null && typeof bio === 'string' && bio.length > 300) {
    return NextResponse.json(
      { data: null, error: { message: 'Bio must be 300 characters or less' } },
      { status: 400 }
    )
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (full_name !== undefined) updates.full_name = full_name.trim()
  if (phone !== undefined) updates.phone = phone || null
  if (bio !== undefined) updates.bio = bio || null
  if (company !== undefined) updates.company = company || null
  if (avatar_url !== undefined) updates.avatar_url = avatar_url || null

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { data: null, error: { message: error.message } },
      { status: 400 }
    )
  }

  // Mirror full_name to auth user metadata for display purposes
  if (full_name !== undefined) {
    await supabase.auth.updateUser({ data: { full_name: full_name.trim() } })
  }

  return NextResponse.json({ data, error: null })
}
