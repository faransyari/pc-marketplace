// pages/builds/[id].js
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function PCBuildDetail() {
  const { query } = useRouter()
  const [build, setBuild] = useState(null)

  useEffect(() => {
    if (query.id) {
      api.get(`builds/${query.id}/`).then(res => setBuild(res.data))
    }
  }, [query.id])

  if (!build) return <p>Loading...</p>

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{build.name}</h1>
      <p className="text-gray-600 mb-6">{build.description}</p>
      <h2 className="text-xl font-semibold mb-2">Components:</h2>
      <ul className="space-y-2">
        {build.components.map(comp => (
          <li key={comp.id} className="border p-2 rounded">
            <strong>{comp.component_type.name}</strong>: {comp.product.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
