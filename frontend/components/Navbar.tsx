'use client'
import Link from 'next/link'
import { useState } from 'react'
import { FaShoppingCart, FaBell, FaEnvelope, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa'
import StoreDropdown from './dropdowns/StoreDropdown'
import ComputersDropdown from './dropdowns/ComputersDropdown'
import AccessoriesDropdown from './dropdowns/AccessoriesDropdown'
import HeadphonesDropdown from './dropdowns/HeadphonesDropdown'
import DisplaysDropdown from './dropdowns/DisplaysDropdown'
import KeyboardsAndMouseDropdown from './dropdowns/KeyboardsAndMouseDropdown'


export default function Navbar() {
    const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    return (
        <>
            <nav className="bg-white sticky top-0 z-50 opacity-98 backdrop-blur-lg">
                <div className="max-w-4xl mx-auto px-4 flex items-center justify-between relative h-14">
                    {/* Logo */}
                    <Link href="/" className="text-xs font-bold text-gray-600 whitespace-nowrap">
                        PC Marketplace
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap flex-1 justify-center border-transparent">
                        {[
                            { key: 'store', label: 'Store' },
                            { key: 'computers', label: 'Computers' },
                            { key: 'keyboards-mice', label: 'Keyboards and Mice' },
                            { key: 'headphones', label: 'Headphones' },
                            { key: 'displays', label: 'Displays' },
                            { key: 'accessories', label: 'Accessories' },
                        ].map(({ key, label }) => (
                            <div
                                key={key}
                                className="relative px-3 py-4 cursor-pointer"
                                onMouseEnter={() => setActiveCategoryTab(key)}
                                onMouseLeave={() => setActiveCategoryTab(null)}
                            >
                                <span className="text-gray-700 font-medium flex items-center text-xs">
                                    {label}
                                </span>
                            </div>
                        ))}
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
                    {[
                        { key: 'store', label: 'Store' },
                        { key: 'computers', label: 'Computers' },
                        { key: 'keyboards-mice', label: 'Keyboards and Mice' },
                        { key: 'headphones', label: 'Headphones' },
                        { key: 'displays', label: 'Displays' },
                        { key: 'accessories', label: 'Accessories' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            className="text-gray-700 font-medium text-sm text-left py-2"
                            onClick={() => {
                                setActiveCategoryTab(key)
                                setMobileMenuOpen(false)
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Categories Overlay */}
            <StoreDropdown
            active={activeCategoryTab === 'store'}
            onMouseEnter={() => setActiveCategoryTab('store')}
            onMouseLeave={() => setActiveCategoryTab(null)}
            />
            <ComputersDropdown
            active={activeCategoryTab === 'computers'}
            onMouseEnter={() => setActiveCategoryTab('computers')}
            onMouseLeave={() => setActiveCategoryTab(null)}
            />
            <KeyboardsAndMouseDropdown
            active={activeCategoryTab === 'keyboards-mice'}
            onMouseEnter={() => setActiveCategoryTab('keyboards-mice')}
            onMouseLeave={() => setActiveCategoryTab(null)}
            />
            <HeadphonesDropdown
            active={activeCategoryTab === 'headphones'}
            onMouseEnter={() => setActiveCategoryTab('headphones')}
            onMouseLeave={() => setActiveCategoryTab(null)}
            />
            <DisplaysDropdown
            active={activeCategoryTab === 'displays'}
            onMouseEnter={() => setActiveCategoryTab('displays')}
            onMouseLeave={() => setActiveCategoryTab(null)}
            />
            <AccessoriesDropdown
            active={activeCategoryTab === 'accessories'}
            onMouseEnter={() => setActiveCategoryTab('accessories')}
            onMouseLeave={() => setActiveCategoryTab(null)}
            />
            

        </>
    )
}
