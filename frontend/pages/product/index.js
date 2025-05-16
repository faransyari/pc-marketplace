import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Available Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(prod => (
          <div key={prod.id} className="border rounded-xl p-4 shadow">
            <h2 className="font-semibold">{prod.title}</h2>
            <p>{prod.description}</p>
            <p className="text-sm text-gray-500">Rp {prod.price}</p>
            <p className="text-xs">Condition: {prod.condition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
