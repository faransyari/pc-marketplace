// components/dropdowns/StoreDropdown.tsx
'use client'
import Link from 'next/link'
import React from 'react'

interface StoreDropdownProps {
  active: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function StoreDropdown({ active, onMouseEnter, onMouseLeave }: StoreDropdownProps) {
  return (
    <>
      {/* Overlay background */}
      <div
        className={`
          fixed inset-0 z-30 bg-white/30 transition-all duration-500
          ${active ? 'backdrop-blur-xs opacity-100 pointer-events-auto' : 'backdrop-blur-0 opacity-0 pointer-events-none'}
        `}
        onClick={onMouseLeave}
        aria-hidden="true"
      />
      
      {/* Dropdown panel */}
      <div
        className={`fixed left-0 py-18 px-6 top-[10px] w-screen bg-white transition-transform duration-500 overflow-hidden z-40 ${
          active ? 'translate-y-0' : '-translate-y-200'
        }`}
        style={{ willChange: 'transform' }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          className={`max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-gray-700 text-sm transition-opacity duration-200 delay-200 ${
            active ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {[
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
          ].map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 mb-1">{col.title}</span>
              {col.items.map((cat, idx) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className={`
                    transition-all duration-400
                    ${active ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
                    ${colIdx === 0 ? 'text-2xl font-bold' : ''}
                    font-semibold
                  `}
                  style={{
                    transitionDelay: active
                      ? `${(colIdx * col.items.length + idx) * 50 + 100}ms`
                      : `${(col.items.length - 1 - idx) * 30}ms`,
                  }}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
