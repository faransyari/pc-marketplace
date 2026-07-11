'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', first_name: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    setBusy(true)
    try {
      await register({ username: form.username, email: form.email, first_name: form.first_name, password: form.password })
      router.push('/profile')
    } catch (err: any) {
      const data = err?.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Could not create account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <div className="eyebrow mb-2">Join the marketplace</div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Create account</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="field" placeholder="Username" value={form.username} onChange={e => update('username', e.target.value)} />
        <input className="field" placeholder="First name" value={form.first_name} onChange={e => update('first_name', e.target.value)} />
        <input className="field" type="email" placeholder="Email" value={form.email} onChange={e => update('email', e.target.value)} />
        <input className="field" type="password" placeholder="Password" value={form.password} onChange={e => update('password', e.target.value)} />
        <input className="field" type="password" placeholder="Confirm password" value={form.confirm} onChange={e => update('confirm', e.target.value)} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="text-sm text-muted mt-4">
        Already have an account? <Link href="/login" className="text-violet hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
