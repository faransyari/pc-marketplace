// pages/builds/index.js
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'

export default function PCBuildList() {
  const [builds, setBuilds] = useState([])

  useEffect(() => {
    api.get('builds/').then(res => setBuilds(res.data))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">PC Builds</h1>
      {builds.map(build => (
        <Link key={build.id} href={`/builds/${build.id}`}>
          <div className="border rounded p-3 mb-3 shadow cursor-pointer hover:bg-gray-50">
            <h2 className="font-semibold">{build.name}</h2>
            <p className="text-sm text-gray-500">{build.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
