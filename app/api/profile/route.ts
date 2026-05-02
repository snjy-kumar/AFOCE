import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import {
  errorResponse,
  validationErrorResponse,
  logError,
} from '@/lib/utils/error-handler'
import { checkRateLimit, rateLimitResponse } from '@/lib/utils/rate-limit'

/**
 * GET /api/profile - Get current user profile
 *
 * @returns User profile data
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse(401, 'Unauthorized')
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        'id, email, full_name, role, department, status, org_id, avatar_url, phone, bio, company, created_at, updated_at'
      )
      .eq('id', user.id)
      .single()

    if (error) {
      logError(error, { method: 'GET', path: '/api/profile', userId: user.id })
      return errorResponse(500, 'Failed to fetch profile')
    }

    return NextResponse.json({ data: profile, error: null })
  } catch (error) {
    logError(error, { method: 'GET', path: '/api/profile' })
    return errorResponse(500, 'Internal server error')
  }
}

/**
 * PUT /api/profile - Update current user profile
 *
 * @body full_name - User's full name (optional)
 * @body phone - Phone number (optional)
 * @body bio - User bio (optional)
 * @body company - Company name (optional)
 * @body avatar_url - Avatar URL (optional)
 * @returns Updated profile data
 */
export async function PUT(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req, 'api')
    if (!rl.success) return rateLimitResponse(rl.remaining, rl.reset)

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse(401, 'Unauthorized')
    }

    const body = await req.json()
    const { full_name, phone, bio, company, avatar_url } = body

    // Validate full_name if provided
    if (
      full_name !== undefined &&
      (typeof full_name !== 'string' || full_name.trim().length < 1)
    ) {
      return errorResponse(400, 'Name is required and must be a non-empty string')
    }

    // Validate phone length if provided
    if (
      phone !== undefined &&
      phone !== null &&
      typeof phone === 'string' &&
      phone.length > 30
    ) {
      return errorResponse(400, 'Phone number is too long (max 30 characters)')
    }

    // Validate bio length if provided
    if (
      bio !== undefined &&
      bio !== null &&
      typeof bio === 'string' &&
      bio.length > 300
    ) {
      return errorResponse(400, 'Bio must be 300 characters or less')
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
      logError(error, {
        method: 'PUT',
        path: '/api/profile',
        userId: user.id,
      })
      return errorResponse(500, 'Failed to update profile')
    }

    // Mirror full_name to auth user metadata for display purposes
    if (full_name !== undefined) {
      await supabase.auth.updateUser({ data: { full_name: full_name.trim() } })
    }

    return NextResponse.json({ data, error: null })
  } catch (error) {
    logError(error, { method: 'PUT', path: '/api/profile' })
    return errorResponse(500, 'Internal server error')
  }
}
