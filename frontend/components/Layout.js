import Link from 'next/link'
import { useContext } from 'react'
import { AuthContext } from '@/lib/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext)

  const handleLogout = async () => {
    try {
      await logout()
      alert('Logged out successfully')
    } catch (error) {
      console.error('Logout failed:', error)
      alert('Logout failed')
    }
  }

  return (
    <div>
      <nav className="bg-gray-800 text-white px-4 py-3 flex gap-6 items-center">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/product" className="hover:underline">Products</Link>
        <Link href="/builds" className="hover:underline">Builds</Link>
        <Link href="/builds/create" className="hover:underline">Create Build</Link>
        <Link href="/product/sell" className="hover:underline">Sell</Link>
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>

        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm">
                Hi, {user.first_name || 'No Name'} {user.last_name || 'No Name'}
              </span>
              <button onClick={handleLogout} className="hover:underline text-red-400">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Login</Link>
              <Link href="/register" className="hover:underline">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
