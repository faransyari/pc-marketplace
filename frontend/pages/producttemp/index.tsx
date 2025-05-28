import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  condition: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get<Product[]>('products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Available Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(prod => (
          <div key={prod.id} className="border rounded-xl p-4 shadow">
            <a href={`/product/${prod.id}`} className="text-lg font-semibold hover:underline">
              {prod.title}
            </a>
            <p>{prod.description}</p>
            <p className="text-sm text-gray-500">Rp {prod.price}</p>
            <p className="text-xs">Condition: {prod.condition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
