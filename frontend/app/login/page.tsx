'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'

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
      setError('Wrong username or password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <div className="eyebrow mb-2">Welcome back</div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Sign in</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="field" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="field" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="text-sm text-muted mt-4">
        New here? <Link href="/register" className="text-violet hover:underline">Create an account</Link>
      </p>
    </div>
  )
}
