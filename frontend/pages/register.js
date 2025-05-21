import { useState } from 'react'
import api from '@/lib/api'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [first_name, setFirstName] = useState('')
  const [last_name, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!username || !email || !password || !confirmPassword) {
      alert('Please fill in all fields')
      return
    }
    if (password.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email address')
      return
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      alert('Username can only contain letters and numbers')
      return
    }
    if (username.length < 3 || username.length > 20) {
      alert('Username must be between 3 and 20 characters long')
      return
    }
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      alert('Password can only contain letters and numbers')
      return
    }

    try {
        const res = await api.post('users/', { username, email, password, first_name, last_name })
        console.log('Response:', res.data)
        alert('✅ Registration successful!')
        return  // ✅ prevent further execution
    } catch (err) {
        const msg = JSON.stringify(err.response?.data || { error: err.message }, null, 2)
        alert('❌ Registration failed:\n' + msg)
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

  }

  return (
    <form onSubmit={handleRegister} className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Register</h1>
      <input className="w-full border p-2" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="w-full border p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="w-full border p-2" placeholder="First Name" value={first_name} onChange={e => setFirstName(e.target.value)} />
      <input className="w-full border p-2" placeholder="Last Name" value={last_name} onChange={e => setLastName(e.target.value)} />
      <input className="w-full border p-2" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <input className="w-full border p-2" placeholder="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      <button className="bg-green-600 text-white px-4 py-2 rounded">Register</button>
    </form>
  )
}
