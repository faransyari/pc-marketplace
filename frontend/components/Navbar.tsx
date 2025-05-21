'use client'
import Link from 'next/link'
import { useState } from 'react'
import { FaShoppingCart, FaBell, FaEnvelope, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa'

export default function Navbar() {
    const [search, setSearch] = useState('')
    const [showCategories, setShowCategories] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (search.trim()) {
            window.location.href = `/product?search=${search}`
        }
    }

    const navLinks = [
        { label: 'Store', onClick: () => setShowCategories(true), className: 'relative px-3 py-4 cursor-pointer', showOnMobile: false },
        { label: 'Computers', href: '/computers' },
        { label: 'Keyboards and Mice', href: '/keyboards-mice' },
        { label: 'Headphones', href: '/headphones' },
        { label: 'Display', href: '/display' },
        { label: 'Accessories', href: '/accessories' },
    ]

    return (
        <>
            <nav className="bg-white sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-6 relative h-14">
                    {/* Logo */}
                    <Link href="/" className="text-xs font-bold text-gray-600 whitespace-nowrap">
                        PC Marketplace
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-4 flex-1 justify-center border-transparent">
                        <div
                            className="relative px-3 py-4 cursor-pointer"
                            onMouseEnter={() => setShowCategories(true)}
                            onMouseLeave={() => setShowCategories(false)}
                        >
                            <span className="text-gray-700 font-medium flex items-center text-xs">
                                Store
                            </span>
                        </div>
                        <Link href="/computers" className="text-gray-700 font-medium flex items-center text-xs">
                            Computers
                        </Link>
                        <Link href="/keyboards-mice" className="text-gray-700 font-medium flex items-center text-xs">
                            Keyboards and Mice
                        </Link>
                        <Link href="/headphones" className="text-gray-700 font-medium flex items-center text-xs">
                            Headphones
                        </Link>
                        <Link href="/display" className="text-gray-700 font-medium flex items-center text-xs">
                            Display
                        </Link>
                        <Link href="/accessories" className="text-gray-700 font-medium flex items-center text-xs">
                            Accessories
                        </Link>
                    </div>

                    {/* Right: Icons */}
                    <div className="flex items-center gap-4 text-gray-700 text-lg">
                        <Link href="/cart"><FaShoppingCart /></Link>
                        <Link href="/notifications"><FaBell /></Link>
                        <Link href="/messages"><FaEnvelope /></Link>
                        <Link href="/dashboard"><FaUserCircle /></Link>
                        {/* Hamburger for mobile */}
                        <button
                            className="md:hidden ml-2"
                            aria-label="Open menu"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <FaBars />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
            />
            <aside
                className={`fixed top-0 right-0 w-64 h-full bg-white z-50 shadow-lg transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ willChange: 'transform' }}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <span className="font-bold text-gray-700 text-sm">Menu</span>
                    <button
                        className="text-gray-700 text-xl"
                        aria-label="Close menu"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <FaTimes />
                    </button>
                </div>
                <nav className="flex flex-col gap-2 px-4 py-4">
                    <button
                        className="text-gray-700 font-medium text-sm text-left py-2"
                        onClick={() => {
                            setShowCategories(true)
                            setMobileMenuOpen(false)
                        }}
                    >
                        Store
                    </button>
                    <Link href="/computers" className="text-gray-700 font-medium text-sm py-2" onClick={() => setMobileMenuOpen(false)}>
                        Computers
                    </Link>
                    <Link href="/keyboards-mice" className="text-gray-700 font-medium text-sm py-2" onClick={() => setMobileMenuOpen(false)}>
                        Keyboards and Mice
                    </Link>
                    <Link href="/headphones" className="text-gray-700 font-medium text-sm py-2" onClick={() => setMobileMenuOpen(false)}>
                        Headphones
                    </Link>
                    <Link href="/display" className="text-gray-700 font-medium text-sm py-2" onClick={() => setMobileMenuOpen(false)}>
                        Display
                    </Link>
                    <Link href="/accessories" className="text-gray-700 font-medium text-sm py-2" onClick={() => setMobileMenuOpen(false)}>
                        Accessories
                    </Link>
                </nav>
            </aside>

            {/* Categories Overlay */}
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
                className={`fixed left-0 ${
                    typeof window !== 'undefined' && window.innerWidth < 768
                        ? 'py-13 pb-8 px-2 top-[10px]' // Mobile
                        : 'py-18 px-6 top-[10px]' // Desktop
                } w-screen bg-white transition-transform duration-500 overflow-hidden z-40 ${
                    showCategories ? 'translate-y-0' : '-translate-y-200'
                }`}
                style={{ willChange: 'transform' }}
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
            >
                <div
                    className={`max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 text-sm transition-opacity duration-200 delay-200 ${
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
                                    { href: "/new", label: "New Releases" },
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
