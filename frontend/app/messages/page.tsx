'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { Spinner, EmptyState } from '@/components/States'

type Msg = {
  id: number
  sender: number
  sender_username: string
  recipient: number
  product: number
  content: string
  timestamp: string
}

type Thread = {
  key: string
  product: number
  other: number
  otherName: string
  messages: Msg[]
}

export default function MessagesPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [threads, setThreads] = useState<Thread[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  const load = useCallback(async () => {
    if (!user) return
    try {
      const res = await api.get('messages/')
      const list: Msg[] = res.data.results || res.data
      const map = new Map<string, Thread>()
      for (const m of list) {
        const other = m.sender === user.id ? m.recipient : m.sender
        const otherName = m.sender === user.id ? `User ${m.recipient}` : m.sender_username
        const key = `${m.product}-${other}`
        if (!map.has(key)) map.set(key, { key, product: m.product, other, otherName, messages: [] })
        map.get(key)!.messages.push(m)
      }
      setThreads(Array.from(map.values()))
    } catch {
      setThreads([])
    }
  }, [user])

  useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated, load])

  const current = threads.find(t => t.key === active)

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!current || !reply.trim()) return
    setPending(true)
    try {
      await api.post('messages/', { recipient: current.other, product: current.product, content: reply })
      setReply('')
      await load()
    } finally {
      setPending(false)
    }
  }

  if (loading || !user) return <Spinner />

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="eyebrow mb-1">Inbox</div>
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Messages</h1>

      {threads.length === 0 ? (
        <EmptyState title="No messages yet" hint="Conversations about listings appear here." />
      ) : (
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-1">
            {threads.map(t => (
              <button key={t.key} onClick={() => setActive(t.key)}
                className={`w-full text-left card p-3 ${active === t.key ? 'border-violet/50' : ''}`}>
                <div className="text-sm font-medium text-ink">{t.otherName}</div>
                <div className="text-xs text-muted truncate">{t.messages[t.messages.length - 1].content}</div>
              </button>
            ))}
          </div>

          <div className="card p-4 min-h-[300px] flex flex-col">
            {current ? (
              <>
                <div className="eyebrow border-b border-line pb-2 mb-3">Conversation with {current.otherName}</div>
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[50vh]">
                  {current.messages.map(m => {
                    const mine = m.sender === user.id
                    return (
                      <div key={m.id} className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? 'ml-auto bg-violet text-white' : 'bg-panel text-ink'}`}>
                        {m.content}
                      </div>
                    )
                  })}
                </div>
                <form onSubmit={sendReply} className="flex gap-2 mt-3 pt-3 border-t border-line">
                  <input className="field text-sm" placeholder="Write a reply" value={reply} onChange={e => setReply(e.target.value)} />
                  <button className="btn btn-primary" disabled={pending}>Send</button>
                </form>
              </>
            ) : (
              <div className="m-auto text-sm text-muted">Select a conversation</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
