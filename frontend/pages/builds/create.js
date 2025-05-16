import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function CreatePCBuild() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [componentTypes, setComponentTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState({});

  useEffect(() => {
    // Load all component types and products
    api.get('components/').then(res => setComponentTypes(res.data));
    api.get('products/').then(res => setProducts(res.data));
  }, []);

  const handleComponentChange = (typeId, productId) => {
    setSelectedComponents(prev => ({ ...prev, [typeId]: productId }));
  };

  const handleSubmit = async () => {
    try {
      // 1. Create the build
      const buildRes = await api.post('builds/', {
        name,
        description,
      });
      const buildId = buildRes.data.id;

      // 2. Create build components
      for (const [typeId, productId] of Object.entries(selectedComponents)) {
        await api.post('build-components/', {
          build: buildId,
          product: productId,
          component_type: typeId,
        });
      }

      alert('Build created successfully!');
    } catch (error) {
      console.error(error);
      alert('Error creating build.');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create PC Build</h1>

      <input
        className="w-full border rounded p-2 mb-2"
        placeholder="Build Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <textarea
        className="w-full border rounded p-2 mb-4"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      {componentTypes.map(type => (
        <div key={type.id} className="mb-4">
          <label className="block font-semibold">{type.name}</label>
          <select
            className="w-full border p-2 rounded"
            onChange={e => handleComponentChange(type.id, e.target.value)}
          >
            <option value="">Select a {type.name}</option>
            {products
              .filter(p => p.component_type === type.id)
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} (Rp {p.price})
                </option>
              ))}
          </select>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Build
      </button>
    </div>
  );
}
