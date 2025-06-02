'use client'
import { useEffect, useState, useRef } from 'react'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'
import Link from 'next/link'

const CATEGORIES = [
    'Computers',
    'Desktops',
    'Gaming',
    'Accessories',
    'Graphics card',
]

function ProductGrid({ products }: { products: any[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeft, setShowLeft] = useState(false)
    const [showRight, setShowRight] = useState(true)

    const SCROLL_AMOUNT = 300 // px to scroll per click

    const updateArrows = () => {
        const el = scrollRef.current
        if (!el) return

        setShowLeft(el.scrollLeft > 0)
        setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        updateArrows()
        el.addEventListener('scroll', updateArrows)
        return () => el.removeEventListener('scroll', updateArrows)
    }, [])

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
            behavior: 'smooth',
        })
    }

    return (
        <div className="relative w-full">
            {/* Scroll container */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scroll-smooth pr-8"
                style={{
                    scrollbarWidth: 'none', // Firefox
                    paddingBottom: '16px', // Add space between scrollbar and products
                    paddingLeft: '16px', // Add space on the left for the left arrow
                }}
            >
                <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                {products.map((product: any) => (
                    <Link
                        href={`/product/${product.id}`}
                        key={product.id}
                        className="min-w-[250px] max-w-xs flex-shrink-0 rounded-3xl p-4 hover:shadow transition bg-white flex flex-col h-full border-none shadow-sm"
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                            {product.title}
                        </h3>
                        <div className="h-40 bg-gray-100 mb-3 rounded flex items-center justify-center">
                            {/* Add <img src={product.image} /> when available */}
                        </div>
                        <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">
                            {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                            <p className="text-gray-600 font-medium">${product.price}</p>
                            <button
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition duration-200 cursor-pointer"
                                onClick={e => {
                                    e.preventDefault()
                                    alert(`Added ${product.title} to cart`)
                                }}
                            >
                                Buy
                            </button>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Left arrow */}
            {showLeft && (
                <>
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-gray-400 text-white hover:bg-gray-300 p-3 rounded-full shadow-lg opacity-25 hover:opacity-50 transition"
                        aria-label="Scroll left"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Right arrow */}
            {showRight && (
                <>
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-gray-400 text-white hover:bg-gray-300 p-3 rounded-full shadow-lg opacity-25 hover:opacity-50 transition"
                        aria-label="Scroll right"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    )
}

export default function ProductListPage() {
    const [products, setProducts] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products/')
                setProducts(res.data)
            } catch (err) {
                console.error('Failed to fetch products:', err)
            }
        }
        fetchProducts()
    }, [])

    const officialProducts = products.filter((p: any) => p.is_official)

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-10 bg-white">
                {/* Search Bar */}
                <div className="mb-8 flex justify-center items-center">
                    <div className="relative w-full max-w-md flex items-center">
                        <button
                            className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition"
                            aria-label="Show filters"
                            type="button"
                            onClick={() => setShowDropdown((v: boolean) => !v)}
                        >
                            {/* Down arrow icon */}
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-3xl shadow-sm focus:outline-none focus:ring-2 focus:ring-grey-400 placeholder:text-gray-400"
                        />
\                        {showDropdown && (
                            <div className="absolute left-0 top-12 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4">
                                <div className="mb-2 font-semibold text-gray-700">Filter Products</div>
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2 text-gray-600">
                                        <input type="checkbox" className="accent-blue-600" />
                                        Official Only
                                    </label>
                                    <label className="flex items-center gap-2 text-gray-600">
                                        <input type="checkbox" className="accent-blue-600" />
                                        In Stock
                                    </label>
                                    <label className="flex items-center gap-2 text-gray-600">
                                        <input type="checkbox" className="accent-blue-600" />
                                        Free Shipping
                                    </label>
                                </div>
                                <button
                                    className="mt-4 w-full bg-blue-600 text-white rounded-3xl py-2 hover:bg-blue-700 transition"
                                    type="button"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    Apply Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* Official Products Section */}
                <section className="mb-16">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">All Products</h1>
                    {officialProducts.length === 0 ? (
                        <div>
                            {CATEGORIES.map(category => {
                                const filtered = officialProducts.filter((p: any) => p.category === category)
                                return (
                                    <div key={category}>
                                        <h2 className="text-2xl font-semibold mb-4 text-gray-500">{category}</h2>
                                        {filtered.length === 0 ? (
                                            <>
                                                {/* Dummy products */}
                                                <ProductGrid
                                                    products={[
                                                        {
                                                            id: `dummy-${category}-1`,
                                                            title: `${category} Example 1`,
                                                            description: `Sample description for ${category} product 1.`,
                                                            price: 99.99,
                                                            is_official: true,
                                                        },
                                                        {
                                                            id: `dummy-${category}-2`,
                                                            title: `${category} Example 2`,
                                                            description: `Sample description for ${category} product 2.`,
                                                            price: 149.99,
                                                            is_official: true,
                                                        },
                                                        {
                                                            id: `dummy-${category}-3`,
                                                            title: `${category} Example 3`,
                                                            description: `Sample description for ${category} product 3.`,
                                                            price: 129.99,
                                                            is_official: true,
                                                        },
                                                        {
                                                            id: `dummy-${category}-4`,
                                                            title: `${category} Example 4`,
                                                            description: `Sample description for ${category} product 4.`,
                                                            price: 179.99,
                                                            is_official: true,
                                                        },
                                                        {
                                                            id: `dummy-${category}-5`,
                                                            title: `${category} Example 5`,
                                                            description: `Sample description for ${category} product 5.`,
                                                            price: 199.99,
                                                            is_official: true,
                                                        },
                                                    ]}
                                                />
                                            </>
                                        ) : (
                                            <ProductGrid products={filtered} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <ProductGrid products={officialProducts} />
                    )}
                </section>
            </div>
        </div>
    )
}
