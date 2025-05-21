// pages/sell.js
import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function SellProduct() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('new')
  const [category, setCategory] = useState('')
  const [componentType, setComponentType] = useState('')
  const [specs, setSpecs] = useState('')
  const [location, setLocation] = useState('')

  const [categories, setCategories] = useState([])
  const [componentTypes, setComponentTypes] = useState([])

  useEffect(() => {
    api.get('categories/').then(res => setCategories(res.data))
    api.get('components/').then(res => setComponentTypes(res.data))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await api.post('products/', {
        title,
        description,
        price,
        condition,
        category,
        component_type: componentType || null,
        specs,
        location,
        seller,
        seller_type: 'user',
      })
      alert('Product listed successfully!')
    } catch (error) {
      console.error(error)
      alert('Something went wrong.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sell a Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full p-2 border rounded" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="w-full p-2 border rounded" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input className="w-full p-2 border rounded" type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
        
        <select className="w-full p-2 border rounded" value={condition} onChange={e => setCondition(e.target.value)}>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="refurbished">Refurbished</option>
        </select>

        <select className="w-full p-2 border rounded" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">-- Select Category --</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select className="w-full p-2 border rounded" value={componentType} onChange={e => setComponentType(e.target.value)}>
          <option value="">-- Select Component Type (optional) --</option>
          {componentTypes.map(comp => (
            <option key={comp.id} value={comp.id}>{comp.name}</option>
          ))}
        </select>

        <textarea className="w-full p-2 border rounded" placeholder="Specs (as JSON)" value={specs} onChange={e => setSpecs(e.target.value)} />

        <input className="w-full p-2 border rounded" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">
          Submit
        </button>
      </form>
    </div>
  )
}
