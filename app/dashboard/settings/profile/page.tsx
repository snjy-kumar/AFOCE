'use client'
import { useEffect, useState, useRef } from 'react'
import { Camera, User, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import Image from 'next/image'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  company: string | null
  phone: string | null
  bio: string | null
  avatar_url: string | null
}

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const [form, setForm] = useState({
    full_name: '',
    company: '',
    phone: '',
    bio: '',
    avatar_url: '',
  })

  useEffect(() => {
    async function load() {
      const isDemo =
        typeof window !== 'undefined' &&
        localStorage.getItem('demo_session') === 'true'

      if (isDemo) {
        setProfile({
          id: 'demo',
          email: 'demo@afoce.com',
          full_name: 'Demo User',
          role: 'finance_admin',
          company: 'AFOCE Advisory Labs',
          phone: null,
          bio: null,
          avatar_url: null,
        })
        setForm({
          full_name: 'Demo User',
          company: 'AFOCE Advisory Labs',
          phone: '',
          bio: '',
          avatar_url: '',
        })
        setLoading(false)
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const res = await fetch('/api/profile')
      if (res.ok) {
        const { data } = await res.json()
        setProfile(data)
        setForm({
          full_name: data.full_name ?? '',
          company: data.company ?? '',
          phone: data.phone ?? '',
          bio: data.bio ?? '',
          avatar_url: data.avatar_url ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setStatus({ type: 'error', message: 'Image must be under 5MB' })
      return
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setStatus({ type: 'error', message: 'Only JPEG, PNG and WebP images are allowed' })
      return
    }

    setUploading(true)
    setStatus(null)

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setStatus({ type: 'error', message: uploadError.message })
      setUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path)

    setForm(f => ({ ...f, avatar_url: publicUrl }))

    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar_url: publicUrl }),
    })

    setStatus({ type: 'success', message: 'Avatar updated!' })
    setUploading(false)

    // Reset file input so the same file can be re-selected
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.full_name,
        company: form.company,
        phone: form.phone,
        bio: form.bio,
      }),
    })

    const { error } = await res.json()
    setSaving(false)

    if (!res.ok || error) {
      setStatus({ type: 'error', message: error?.message || 'Failed to save profile' })
      return
    }

    setStatus({ type: 'success', message: 'Profile updated successfully!' })
    setTimeout(() => setStatus(null), 4000)
  }

  const initials = (form.full_name || user?.email || 'U')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--ink-soft)]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Manage your public profile and personal information
        </p>
      </div>

      {status && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 text-[var(--brand-2)]'
              : 'border border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)]'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {status.message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar section */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <h2 className="mb-4 font-semibold text-[var(--ink)]">Profile Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--brand)] text-white transition hover:border-[var(--brand)]"
              >
                {form.avatar_url ? (
                  <Image
                    src={form.avatar_url}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xl font-bold">
                    {initials}
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">Upload a photo</p>
              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">JPEG, PNG or WebP. Max 5MB.</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="mt-2 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--bg)] disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Change photo'}
              </button>
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
          <h2 className="mb-4 font-semibold text-[var(--ink)]">Personal Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Full name</span>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="John Doe"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
                Email address
              </span>
              <input
                type="email"
                value={user?.email ?? profile?.email ?? ''}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--ink-soft)] opacity-60 outline-none"
              />
              <span className="mt-1 block text-xs text-[var(--ink-soft)]">
                Email cannot be changed here
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Company</span>
              <input
                type="text"
                value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                placeholder="Acme Pvt. Ltd."
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
                Phone number
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+977-98XXXXXXXX"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:bg-white"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Bio</span>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell us a bit about yourself..."
              rows={3}
              maxLength={300}
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:bg-white"
            />
            <span className="mt-0.5 block text-right text-xs text-[var(--ink-soft)]">
              {form.bio.length}/300
            </span>
          </label>
        </div>

        {/* Role / Department (read-only) */}
        {profile && (profile.role || profile.id !== 'demo') && (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <h2 className="mb-4 font-semibold text-[var(--ink)]">Account Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]">
                  Role
                </span>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--ink-soft)] opacity-70">
                  {
                    ({
                      finance_admin: 'Finance Admin',
                      manager: 'Manager',
                      team_member: 'Team Member',
                    } as Record<string, string>)[profile.role] ?? profile.role ?? '—'
                  }
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-medium text-[var(--ink-soft)]">
                  Member since
                </span>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--ink-soft)] opacity-70">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
