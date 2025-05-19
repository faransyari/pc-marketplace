import { useRouter } from 'next/router'
import { useEffect, useState, useContext } from 'react'
import api from '@/lib/api'
import { AuthContext } from '@/lib/AuthContext'

export default function ProductDetail() {
  const { query } = useRouter()
  const [product, setProduct] = useState(null)
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const { user } = useContext(AuthContext)

  const fetchData = async () => {
    const prodRes = await api.get(`products/${query.id}/`)
    setProduct(prodRes.data)

    const msgRes = await api.get(`messages/?product=${query.id}`)
    setMessages(msgRes.data)
  }

  useEffect(() => {
    if (query.id) fetchData()
  }, [query.id])

  const sendMessage = async () => {
    if (!content.trim()) return
    try {
      await api.post('messages/', {
        product: product.id,
        recipient: product.seller,  // assumed field
        content: content,
        sender: user.id,
      })
      setContent('')
      fetchData()
    } catch (err) {
      alert('Failed to send message')
    }
  }

  if (!product) return <p>Loading...</p>

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
      <p className="text-gray-600">{product.description}</p>

      {/* Chat Box */}
      <div className="mt-8 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2">Chat with Seller</h2>
        <div className="h-60 overflow-y-auto border rounded p-3 mb-4 bg-white">
          {messages.map(msg => (
            <div key={msg.id} className={`mb-2 ${msg.sender === user?.id ? 'text-right' : 'text-left'}`}>
              <div className={`text-sm ${msg.sender === user?.id ? 'text-blue-600' : 'text-gray-800'}`}>
                {msg.sender === user?.id ? 'You' : product.seller}
              </div>
              <div className={`inline-block px-3 py-1 rounded-lg ${msg.sender === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                {msg.content}
              </div>
              <div className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            placeholder="Type a message..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white px-4 rounded">Send</button>
        </div>
      </div>
    </div>
  )
}
