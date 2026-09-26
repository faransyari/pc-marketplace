'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import AuthShell from '@/components/AuthShell'

const FIELDS: { key: 'username' | 'first_name' | 'email' | 'password' | 'confirm'; label: string; type?: string; auto: string }[] = [
  { key: 'username', label: 'Username', auto: 'username' },
  { key: 'first_name', label: 'First name', auto: 'given-name' },
  { key: 'email', label: 'Email', type: 'email', auto: 'email' },
  { key: 'password', label: 'Password', type: 'password', auto: 'new-password' },
  { key: 'confirm', label: 'Confirm password', type: 'password', auto: 'new-password' },
]

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
    if (form.password.length < 8) return setError('Use at least 8 characters for your password.')
    if (form.password !== form.confirm) return setError('The two passwords don’t match.')
    setBusy(true)
    try {
      await register({ username: form.username, email: form.email, first_name: form.first_name, password: form.password })
      router.push('/profile')
    } catch (err: any) {
      const data = err?.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Couldn’t create the account. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Create an account" aside="Save builds, sell parts, talk to sellers.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.slice(0, 2).map(f => (
            <div key={f.key}>
              <label htmlFor={f.key} className="field-label">{f.label}</label>
              <input id={f.key} className="field" type={f.type || 'text'} autoComplete={f.auto} value={form[f.key]} onChange={e => update(f.key, e.target.value)} required={f.key === 'username'} />
            </div>
          ))}
        </div>
        {FIELDS.slice(2).map(f => (
          <div key={f.key}>
            <label htmlFor={f.key} className="field-label">{f.label}</label>
            <input id={f.key} className="field" type={f.type || 'text'} autoComplete={f.auto} value={form[f.key]} onChange={e => update(f.key, e.target.value)} required />
            {f.key === 'password' && <p className="text-xs text-ink-2 mt-1.5">At least 8 characters.</p>}
          </div>
        ))}
        {error && <p className="notice-error" role="alert">{error}</p>}
        <button className="btn btn-ink w-full" disabled={busy} data-state={busy ? 'loading' : undefined}>
          {busy ? 'Creating your account…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-ink-2 mt-6">
        Already have one? <Link href="/login" className="link">Sign in</Link>
      </p>
    </AuthShell>
  )
}
