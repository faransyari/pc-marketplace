'use client'
import Link from 'next/link'
import { useState } from 'react'
import { FaShoppingCart, FaBell, FaEnvelope, FaUserCircle } from 'react-icons/fa'
import { text } from 'stream/consumers'

export default function Navbar() {
    const [search, setSearch] = useState('')
    const [showCategories, setShowCategories] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (search.trim()) {
            window.location.href = `/product?search=${search}`
        }
    }

    return (
        <>
            <nav className="bg-white sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-6 relative ">
                    <Link href="/" className="text-xs font-bold text-gray-600">
                        Logo
                    </Link>
                    <div
                        className="relative px-3 py-4 cursor-pointer"
                        onMouseEnter={() => setShowCategories(true)}
                        onMouseLeave={() => setShowCategories(false)}
                    >
                        <span className="text-gray-700 font-medium flex items-center text-xs">
                           Store
                        </span>
                    </div>
                    {/* Right: Icons */}
                    <div className="flex items-center gap-4 text-gray-700 text-lg">
                        <Link href="/cart"><FaShoppingCart /></Link>
                        <Link href="/notifications"><FaBell /></Link>
                        <Link href="/messages"><FaEnvelope /></Link>
                        <Link href="/dashboard"><FaUserCircle /></Link>
                    </div>
                </div>
            </nav>
            <div
                className={`
                    fixed inset-0 z-30 bg-white/30
                    transition-all duration-500
                    ${showCategories ? 'backdrop-blur-xs opacity-100 pointer-events-auto' : 'backdrop-blur-0 opacity-0 pointer-events-none'}
                `}
                onClick={() => setShowCategories(false)}
                aria-hidden="true"
            />
            <div
                className={`fixed left-0 py-5 top-[46px] w-screen bg-white shadow-md transition-transform duration-500 overflow-hidden z-40 ${
                    showCategories ? 'translate-y-0' : '-translate-y-100'
                }`}
                style={{ willChange: 'transform' }}
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
            >
                <div
                    className={`max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-2 px-6 text-gray-700 text-sm transition-opacity duration-200 delay-200 ${
                        showCategories ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                        transitionProperty: 'opacity',
                        transitionDuration: '200ms',
                    }}
                >
                    {(() => {
                        // Each list is its own column
                        const categoriesColumns = [
                            {
                                title: "Computers",
                                items: [
                                    { href: "/new", label: "New" },
                                    { href: "/laptops", label: "Laptops" },
                                    { href: "/desktops", label: "Desktops" },
                                    { href: "/gaming", label: "Gaming" },
                                    { href: "/accessories", label: "Accessories" },
                                    { href: "/graphics-cards", label: "Graphics Cards" },
                                ],
                            },
                            {
                                title: "Displays & Parts",
                                items: [
                                    { href: "/components", label: "Components" },
                                    { href: "/monitors", label: "Monitors" },
                                ],
                            },
                            {
                                title: "Other",
                                items: [
                                    { href: "/storage", label: "Storage" },
                                    { href: "/cooling", label: "Cooling" },
                                    { href: "/peripherals", label: "Peripherals" },
                                ],
                            },
                        ];
                        return categoriesColumns.map((col, colIdx) => (
                            <div key={colIdx} className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 mb-1">{col.title}</span>
                                {col.items.map((cat, idx) => (
                                    <Link
                                        key={cat.href}
                                        href={cat.href}
                                        className={`
                                            transition-all duration-400
                                            ${showCategories
                                                ? 'opacity-100 translate-y-0'
                                                : 'opacity-0 -translate-y-2'
                                            }
                                            ${colIdx === 0 ? 'text-2xl font-bold' : ''}
                                            font-semibold
                                        `}
                                        style={{
                                            transitionDelay: showCategories
                                                ? `${(colIdx * col.items.length + idx) * 50 + 100}ms`
                                                : `${(col.items.length - 1 - idx) * 30}ms`,
                                        }}
                                    >
                                        {cat.label}
                                    </Link>
                                ))}
                            </div>
                        ));
                    })()}
                </div>
            </div>
        </>
    )
}
