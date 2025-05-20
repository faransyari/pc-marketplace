'use client'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div
        className="p-2 text-center text-gray-400 bg-gray-50 overflow-hidden flex items-center justify-center"
        style={{ minHeight: 700, height: 700 }}
      >
        <img
          src="/images/home-pc.png"
          alt="Home PC"
          className="mx-auto w-full max-w-5xl h-auto"
          style={{ transform: 'translateY(300px)' }}
        />
      </div>
      
    </div>
  )
}
