// Assuming your file is: app/product/[id]/page.tsx
// and you're using Next.js 13+ with the app directory

// Your route will NOT work if you're using useRouter() from 'next/router'
// In the new app directory routing system, dynamic route params are accessed via the `params` prop

// This is how your `page.tsx` should look:

import { notFound } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

interface ProductPageProps {
  params: Promise<{ id: string }>;

}

const CATEGORIES = [
  {
    name: 'Computers',
    subcategories: ['Laptops', 'Desktops', 'Workstations'],
  },
  {
    name: 'Gaming',
    subcategories: ['Consoles', 'Gaming PCs', 'Accessories'],
  },
  {
    name: 'Accessories',
    subcategories: ['Keyboards', 'Mice', 'Headphones', 'Webcams'],
  },
  {
    name: 'Graphics Card',
    subcategories: ['NVIDIA', 'AMD', 'External GPUs'],
  },
  {
    name: 'Displays',
    subcategories: ['Monitors', 'Projectors', 'VR Headsets'],
  },
  {
    name: 'Storage',
    subcategories: ['HDD', 'SSD', 'External Drives'],
  },
];

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  let product;
  try {
    const res = await api.get(`products/${id}/`);
    product = res.data;
  } catch (e) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Product Details
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Filter Bar */}
          <div className="bg-white p-2 rounded-md shadow-sm md:col-span-1 text-xs w-full max-w-[200px] self-start">
            <h2 className="text-base font-medium mb-2 text-gray-800">
              Filter by Category
            </h2>
            <div className="space-y-2">
              {CATEGORIES.map(
                (category: { name: string; subcategories: string[] }) => (
                  <div key={category.name}>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                      {category.name}
                    </h3>
                    <div className="space-y-1 pl-2">
                      {category.subcategories.map((subcategory: string) => (
                        <label
                          key={subcategory}
                          className="flex items-center gap-1 text-gray-700 text-xs"
                        >
                          <input
                            type="checkbox"
                            className="accent-blue-600 w-3 h-3"
                          />
                          {subcategory}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Product Personal Info */}
          <div className="grid grid-cols-1 md:col-span-6">
            <div className="bg-white p-4 rounded-lg shadow-md transition-shadow flex flex-col cursor-pointer no-underline">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
                {/* Image column */}
                <div className="col-span-1 flex items-center justify-center">
                  <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                </div>
                {/* Info column */}
                <div className="col-span-2 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h3>
                    {/* {typeof product.rating === 'number' && (
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-500 mr-1">
                          {'★'.repeat(Math.round(product.rating))}
                          {'☆'.repeat(5 - Math.round(product.rating))}
                        </span>
                        <span className="text-sm text-gray-600">({product.rating.toFixed(1)})</span>
                      </div>
                    )} */}
                    {/* static rating */}
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500 mr-1">
                        {'★★★★☆'}
                      </span>
                      <span className="text-sm text-gray-600 mr-1">4.3</span>
                      <span className="text-sm text-gray-600">(100)</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      <span className="font-medium text-gray-700">{product.seller?.name || 'Unknown'}</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Category: {product.category || 'Uncategorized'}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Brand: {product.brand || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Stock: {product.stock || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Created At: {new Date(product.createdAt).toLocaleDateString() || 'N/A'}
                    </p>

                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-base text-gray-700 mb-4">
                      {product.description || 'No description available'}
                    </p>
                  </div>
                </div>
                {/* Actions column */}
                <div className="col-span-1 flex flex-col items-center justify-center">
                  {/* {product.stock > 0 ? ( */}
                  {1 > 0 ? (
                    <div className="flex flex-col items-center mb-2">
                      <p className="text-lg text-green-700 font-semibold mb-2">In Stock</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:cursor-pointer bg-blue-400 hover:bg-blue-500 text-lg font-bold"
                          // onClick handler to decrease quantity
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value="1"
                          readOnly
                          className="w-8 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-base font-medium text-gray-700"
                        />
                        <button
                          type="button"
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:cursor-pointer bg-blue-400 hover:bg-blue-500 text-lg font-bold"
                          // onClick handler to increase quantity
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-red-600 font-semibold mb-2">Out of Stock</p>
                  )}
                  <p className="text-sm text-gray-500 mb-2">SKU: {product.sku || 'N/A'}</p>
                  <p className="text-2xl text-gray-600 font-semibold">${product.price}</p>
                  <button
                    className="w-1/2 bg-blue-600 text-white text-sm py-2 rounded-xl hover:bg-blue-700 transition duration-300 mb-2 cursor-pointer"
                  >
                    Add to Cart
                  </button>
                  <button
                    className="w-1/2 bg-gray-200 text-gray-800 text-sm py-2 rounded-xl hover:bg-gray-300 transition duration-300 cursor-pointer"
                  >
                    Add to Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-10 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
          {/* Add comments rendering logic here */}
          <p className="text-sm text-gray-500">No comments available.</p>
          <div className="mt-4">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2"
              rows={4}
              placeholder="Add a comment..."
            />
            <button className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-xl">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}