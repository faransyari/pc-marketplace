import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function Dashboard() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    api.get('products/')
      .then(res => {
        const userId = 1 // TODO: Replace with auth user ID
        const mine = res.data.filter(p => p.seller === userId)
        setProducts(mine)
      })
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Listings</h1>
      <ul className="space-y-2">
        {products.map(p => (
          <li key={p.id} className="border p-3 rounded">
            <strong>{p.title}</strong> – Rp {p.price}
          </li>
        ))}
      </ul>
    </div>
  )
}
