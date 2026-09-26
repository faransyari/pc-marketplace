'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import AuthShell from '@/components/AuthShell'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(username, password)
      router.push('/profile')
    } catch {
      setError('That username and password don’t match. Check both and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Sign in" aside="Your builds are right where you left them.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="username" className="field-label">Username</label>
          <input id="username" className="field" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password" className="field-label">Password</label>
          <input id="password" className="field" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required aria-invalid={!!error} />
        </div>
        {error && <p className="notice-error" role="alert">{error}</p>}
        <button className="btn btn-ink w-full" disabled={busy} data-state={busy ? 'loading' : undefined}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-ink-2 mt-6">
        New here? <Link href="/register" className="link">Create an account</Link>
      </p>
    </AuthShell>
  )
}
