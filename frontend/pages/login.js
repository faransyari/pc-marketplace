import { useState } from 'react'
import { useRouter } from 'next/router'
import api from '@/lib/api'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('token/', { username, password })
      localStorage.setItem('access', res.data.access)
      localStorage.setItem('refresh', res.data.refresh)
      alert('Login successful')
      router.push('/dashboard')
    } catch (err) {
      alert('Login failed')
    }
  }

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Login</h1>
      <input className="w-full border p-2" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="w-full border p-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
    </form>
  )
}
