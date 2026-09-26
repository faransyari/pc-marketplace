'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LuArrowLeft, LuSendHorizontal } from 'react-icons/lu'
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

const timeFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function MessagesPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loaded, setLoaded] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [pending, setPending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

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
        const t = map.get(key)!
        if (m.sender !== user.id) t.otherName = m.sender_username
        t.messages.push(m)
      }
      setThreads(Array.from(map.values()))
    } catch {
      setThreads([])
    } finally {
      setLoaded(true)
    }
  }, [user])

  useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated, load])

  const current = threads.find(t => t.key === active)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [current?.messages.length, active])

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!current || !reply.trim()) return
    setPending(true)
    setSendError(false)
    try {
      await api.post('messages/', { recipient: current.other, product: current.product, content: reply })
      setReply('')
      await load()
    } catch {
      setSendError(true)
    } finally {
      setPending(false)
    }
  }

  if (loading || !user) return <Spinner />

  return (
    <div className="shell pt-10 sm:pt-14">
      <h1 className="display text-[length:var(--text-page)] leading-[var(--text-page--line-height)] mb-8">Messages</h1>

      {!loaded ? <Spinner /> : threads.length === 0 ? (
        <EmptyState
          title="Quiet in here"
          hint="Ask a seller about a part and the conversation shows up here."
          glyph="headset"
          action={{ href: '/products', label: 'Browse parts' }}
        />
      ) : (
        <div className="panel overflow-hidden grid md:grid-cols-[18rem_minmax(0,1fr)] min-h-[32rem]">
          <ul className={`${current ? 'hidden md:block' : 'block'} md:border-r-[1.5px] border-ink overflow-y-auto max-h-[70vh]`}>
            {threads.map(t => {
              const last = t.messages[t.messages.length - 1]
              const on = active === t.key
              return (
                <li key={t.key}>
                  <button
                    onClick={() => setActive(t.key)}
                    aria-current={on}
                    className={`w-full text-left flex gap-3 px-4 py-3.5 border-b border-rule cursor-pointer transition-colors ${on ? 'bg-accent' : 'hover:bg-paper-2'}`}
                  >
                    <span className="h-10 w-10 shrink-0 rounded-md bg-ink text-paper display text-base flex items-center justify-center">
                      {t.otherName[0]?.toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold truncate">{t.otherName}</span>
                        <span className="num text-[0.65rem] text-ink-2 shrink-0">{timeFmt.format(new Date(last.timestamp))}</span>
                      </span>
                      <span className={`block text-xs truncate ${on ? 'text-ink' : 'text-ink-2'}`}>
                        {last.sender === user.id ? 'You: ' : ''}{last.content}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className={`${current ? 'flex' : 'hidden md:flex'} flex-col min-w-0`}>
            {current ? (
              <>
                <div className="flex items-center gap-3 px-4 h-14 border-b-[1.5px] border-ink">
                  <button onClick={() => setActive(null)} className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-paper-2" aria-label="Back to conversations">
                    <LuArrowLeft />
                  </button>
                  <span className="font-semibold">{current.otherName}</span>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[55vh] p-4 space-y-2.5 bg-paper-2/50">
                  {current.messages.map(m => {
                    const mine = m.sender === user.id
                    return (
                      <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                        <p className={`max-w-[80%] px-3.5 py-2 text-sm rounded-[var(--radius-card)] ${
                          mine ? 'bg-ink text-paper rounded-br-sm' : 'bg-white border border-rule rounded-bl-sm'
                        }`}>
                          {m.content}
                        </p>
                        <span className="num text-[0.65rem] text-ink-3 mt-1 px-1">{timeFmt.format(new Date(m.timestamp))}</span>
                      </div>
                    )
                  })}
                  <div ref={endRef} />
                </div>
                <form onSubmit={sendReply} className="flex gap-2 p-3 border-t-[1.5px] border-ink">
                  <label htmlFor="reply" className="sr-only">Reply</label>
                  <input id="reply" className="field" placeholder="Write a reply" value={reply} onChange={e => setReply(e.target.value)} />
                  <button className="btn btn-accent !px-4" disabled={pending || !reply.trim()} aria-label="Send" data-state={pending ? 'loading' : undefined}>
                    <LuSendHorizontal />
                  </button>
                </form>
                {sendError && <p className="text-xs text-danger px-4 pb-3">Couldn&apos;t send. Try again.</p>}
              </>
            ) : (
              <div className="m-auto text-center p-8">
                <p className="display text-xl mb-1">Pick a conversation</p>
                <p className="text-sm text-ink-2">Your threads are on the left.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
