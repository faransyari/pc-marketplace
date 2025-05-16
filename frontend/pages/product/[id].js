// pages/products/[id].js
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function ProductDetail() {
  const { query } = useRouter()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    if (query.id) {
      api.get(`products/${query.id}/`).then(res => setProduct(res.data))
    }
  }, [query.id])

  if (!product) return <p>Loading...</p>

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">{product.title}</h1>
      <p className="text-gray-600">{product.description}</p>
      <p className="text-lg mt-2">Rp {product.price}</p>
      <p className="text-sm">Condition: {product.condition}</p>
      <p className="text-sm">Location: {product.location}</p>
      <pre className="bg-gray-100 p-2 mt-4 rounded text-sm">{product.specs}</pre>
    </div>
  )
}
