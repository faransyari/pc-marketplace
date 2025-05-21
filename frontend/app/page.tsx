'use client'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div
        className="relative p-2 text-center text-gray-400 bg-gray-100 overflow-hidden flex items-center justify-center"
        style={{ minHeight: 700, height: 700 }}
      >
        <h1 className="absolute left-0 right-0 top-3/8 -translate-y-1/2 flex items-start justify-center font-bold text-gray-800 z-10 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
          Everything PCs
        </h1>
        {/* Desktop Image */}
        <img
          src="/images/home-pc.png"
          alt="Home PC"
          className="hidden sm:block mx-auto max-w-5xl sm:max-w-5xl md:max-w-5xl lg:max-w-5xl xl:max-w-5xl h-auto relative z-10 animate-bounce-slow"
          style={{ transform: 'translateY(300px)' }}
        />
        {/* Mobile Image */}
        <img
          src="/images/home-pc.png"
          alt="Home PC Mobile"
          className="block sm:hidden mx-auto max-w-4xl h-auto relative z-10 animate-bounce-slow"
          style={{ transform: 'translateY(500px)' }}
        />
        <style jsx>{`
          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(300px);
            }
            50% {
              transform: translateY(294px);
            }
          }
          .animate-bounce-slow {
            animation: bounce-slow 4s ease-in-out infinite;
          }
        `}</style>
      </div>
      <div
        className="relative p-2 mt-3 text-center text-gray-400 bg-gray-100 overflow-hidden flex items-center justify-center"
        style={{ minHeight: 700, height: 1000 }}
      >
        <div className="absolute top-25 left-0 right-0 flex flex-col items-center justify-center z-10">
          <h1 className="text-6xl font-bold text-gray-800">
            Gaming Computers
          </h1>
          <h2 className="mt-2 text-2xl font-semibold text-gray-800">
            Built for performance
          </h2>
          <div>
            <button
              className="mt-4 px-6 py-2 bg-blue-600 border-2 border-blue-600 text-white rounded-3xl hover:bg-blue-700 transition duration-300 cursor-pointer"
              onClick={() => window.location.assign('/product')}
            >
              Shop Now
            </button>
            <button
              className="ml-4 mt-4 px-6 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-3xl hover:bg-blue-50 transition duration-300 cursor-pointer"
              onClick={() => window.location.assign('/builds')}
            >
              Build Your Own
            </button>
          </div>
          <img
            src="/images/gaming-pc.png"
            alt="Gaming PC"
            className="w-full max-w-2xl h-auto relative z-10 mt-4"
          />
        </div>
        <div
          className="relative p-2 text-center text-gray-400 bg-gray-100 overflow-hidden flex items-center justify-center"
          style={{ minHeight: 700, height: 700 }}
        >
        </div>
      </div>
      <div
        className="relative p-2 mt-3 text-center text-gray-400 overflow-hidden flex items-center justify-center"
        style={{
          minHeight: 700,
          height: 1000,
          background: 'linear-gradient(to bottom,rgb(230, 228, 255) 0%, #fff 100%)'
        }}
      >
        
      </div>
      <Footer />
    </div>
  )
}
