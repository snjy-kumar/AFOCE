'use client'
import { useState } from 'react'
import { Eye, EyeOff, Shield, LogOut, AlertCircle, CheckCircle2, Loader2, Key } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Weak', color: 'var(--danger)' }
  if (score <= 2) return { score, label: 'Fair', color: 'var(--accent)' }
  if (score <= 3) return { score, label: 'Good', color: 'var(--brand-2)' }
  return { score, label: 'Strong', color: 'var(--success)' }
}

export default function SecuritySettingsPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [signOutLoading, setSignOutLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string; section: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const strength = getPasswordStrength(newPassword)

  function setStatusMsg(type: 'success' | 'error', message: string, section: string) {
    setStatus({ type, message, section })
    if (type === 'success') setTimeout(() => setStatus(null), 4000)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) return setStatusMsg('error', 'Password must be at least 8 characters', 'password')
    if (!/[A-Z]/.test(newPassword)) return setStatusMsg('error', 'Password must contain at least one uppercase letter', 'password')
    if (!/[0-9]/.test(newPassword)) return setStatusMsg('error', 'Password must contain at least one number', 'password')
    if (newPassword !== confirmPassword) return setStatusMsg('error', 'Passwords do not match', 'password')

    setPasswordLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)
    if (error) return setStatusMsg('error', error.message, 'password')
    setNewPassword('')
    setConfirmPassword('')
    setStatusMsg('success', 'Password changed successfully!', 'password')
  }

  async function handleSendResetEmail() {
    setResetLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { setResetLoading(false); return }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/confirm?type=recovery&next=/reset-password`,
    })
    setResetLoading(false)
    if (error) return setStatusMsg('error', error.message, 'reset')
    setStatusMsg('success', 'Reset email sent! Check your inbox.', 'reset')
  }

  async function handleSignOutAll() {
    setSignOutLoading(true)
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/login')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const StatusAlert = ({ section }: { section: string }) =>
    status?.section === section ? (
      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
        status.type === 'success'
          ? 'border border-[var(--brand-2)]/30 bg-[var(--brand-2)]/10 text-[var(--brand-2)]'
          : 'border border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)]'
      }`}>
        {status.type === 'success'
          ? <CheckCircle2 className="h-4 w-4 shrink-0" />
          : <AlertCircle className="h-4 w-4 shrink-0" />}
        {status.message}
      </div>
    ) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--ink)]">Security Settings</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Manage your password, sessions, and account security</p>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)]/10">
            <Key className="h-5 w-5 text-[var(--brand)]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--ink)]">Change Password</h2>
            <p className="text-xs text-[var(--ink-soft)]">Choose a strong password for your account</p>
          </div>
        </div>

        <StatusAlert section="password" />

        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">New password</span>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 pr-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)] transition"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{ backgroundColor: i <= strength.score ? strength.color : 'var(--border)' }}
                    />
                  ))}
                </div>
                {strength.label && (
                  <span className="mt-1 block text-xs font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                )}
              </div>
            )}
            <p className="mt-1 text-xs text-[var(--ink-soft)]">Min 8 chars, 1 uppercase, 1 number</p>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">Confirm new password</span>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 pr-11 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)] transition"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && newPassword && (
              <p className={`mt-1 text-xs ${newPassword === confirmPassword ? 'text-[var(--brand-2)]' : 'text-[var(--danger)]'}`}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-60"
            >
              {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
              {passwordLoading ? 'Saving...' : 'Update Password'}
            </button>
            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={resetLoading}
              className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink-soft)] transition hover:border-[var(--brand)] hover:text-[var(--ink)] disabled:opacity-60"
            >
              {resetLoading ? 'Sending...' : 'Send reset email instead'}
            </button>
          </div>

          <StatusAlert section="reset" />
        </form>
      </div>

      {/* Active Sessions */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-2)]/10">
            <Shield className="h-5 w-5 text-[var(--brand-2)]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--ink)]">Active Sessions</h2>
            <p className="text-xs text-[var(--ink-soft)]">Manage devices and sign-in sessions</p>
          </div>
        </div>

        <p className="mb-4 text-sm text-[var(--ink-soft)]">
          Sign out of your current session or revoke access from all devices. This is useful if you
          suspect your account has been compromised or you left a device signed in.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink-soft)] transition hover:border-[var(--brand)] hover:text-[var(--ink)]"
          >
            <LogOut className="h-4 w-4" />
            Sign out this device
          </button>
          <button
            onClick={handleSignOutAll}
            disabled={signOutLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-white px-4 py-2.5 text-sm font-medium text-[var(--danger)] transition hover:bg-[var(--danger)]/5 disabled:opacity-60"
          >
            {signOutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sign out all devices
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="mb-1 font-semibold text-[var(--ink)]">Account</h2>
        <p className="text-xs text-[var(--ink-soft)]">
          Your account email is managed through Supabase Auth and cannot be changed from this panel.
          Contact your administrator to update your login email.
        </p>
      </div>
    </div>
  )
}
