"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

const CATEGORIES = [
  { name: 'Computers', subcategories: ['Laptops', 'Desktops', 'Workstations'] },
  { name: 'Gaming', subcategories: ['Consoles', 'Gaming PCs', 'Accessories'] },
  { name: 'Accessories', subcategories: ['Keyboards', 'Mice', 'Headphones', 'Webcams'] },
  { name: 'Graphics Card', subcategories: ['NVIDIA', 'AMD', 'External GPUs'] },
  { name: 'Displays', subcategories: ['Monitors', 'Projectors', 'VR Headsets'] },
  { name: 'Storage', subcategories: ['HDD', 'SSD', 'External Drives'] },
];

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/');
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSearch = () => setSearchQuery(searchInput);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const filteredProducts = products.filter((product: any) => {
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 text-center">Products</h1>

        {/* Search Bar */}
        <div className="mb-4 flex justify-center items-center">
          <div className="relative w-full max-w-md flex items-center">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-400 text-gray-600"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        {/* Filter Toggle for Mobile */}
        <div className="md:hidden mb-4">
          <button
            className="w-full bg-white px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-xl shadow-sm flex justify-between font"
            onClick={() => setFilterOpen(prev => !prev)}
          >
            {filterOpen ? 'Hide Filters' : 'Show Filters'}
            <span>{filterOpen ? '▲' : '▼'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Filter Panel */}
          {(filterOpen || typeof window === 'undefined' || window.innerWidth >= 768) && (
            <div className="md:col-span-1 w-full md:max-w-[200px]">
              <div className="bg-white p-3 rounded-lg shadow-sm text-xs">
                <h2 className="text-base font-medium mb-2 text-gray-700 text-center">Filter</h2>
                <div className="space-y-2">
                  {CATEGORIES.map(category => (
                    <div key={category.name}>
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">{category.name}</h3>
                      <div className="space-y-1 pl-2">
                        {category.subcategories.map(sub => (
                          <label key={sub} className="flex items-center gap-1 text-gray-700 text-xs">
                            <input
                              type="checkbox"
                              className="accent-blue-600 w-3 h-3"
                              checked={selectedCategories.includes(sub)}
                              onChange={() => toggleCategory(sub)}
                            />
                            {sub}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:col-span-6">
            {filteredProducts.map((product: any) => (
              <a
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow flex flex-col h-64 cursor-pointer no-underline"
              >
                <div className="h-32 bg-gray-100 mb-3 rounded flex items-center justify-center">
                  {/* <img src={product.image} className="h-full object-contain" alt="Product image" /> */}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  {product.seller?.name || 'Unknown'}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-gray-600 font-medium">${product.price}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}