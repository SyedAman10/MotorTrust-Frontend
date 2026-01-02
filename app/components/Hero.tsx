'use client';

export default function Hero() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
      <div className="text-center space-y-8">
        <div className="inline-block glass px-6 py-2 rounded-full text-[#2ec8c6] font-semibold mb-4">
          🎯 The Universal Repair Passport for Every Car
        </div>
        <h1 className="text-6xl md:text-8xl font-bold leading-tight">
          <span className="block">Your Car&apos;s</span>
          <span className="gradient-text block">Digital Twin</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          AI-powered repair tracking that connects car owners, repair shops, insurance companies, 
          and vehicle history platforms in one unified ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <a href="/signup" className="bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-8 py-4 rounded-full text-lg transition-all transform hover:scale-105 animate-pulse-glow w-full sm:w-auto text-center">
            Get Started
          </a>
          <button className="glass hover:glass-strong text-white font-bold px-8 py-4 rounded-full text-lg transition-all transform hover:scale-105 w-full sm:w-auto">
            Watch Demo
          </button>
        </div>
      </div>

      {/* Hero Image / Animation */}
      <div className="mt-20 relative">
        <div className="glass-strong rounded-3xl p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6 text-center transform hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🔍</div>
              <div className="text-3xl font-bold text-[#2ec8c6]">AI Scan</div>
              <div className="text-gray-400 mt-2">Instant Diagnosis</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center transform hover:scale-105 transition-transform" style={{ transitionDelay: '100ms' }}>
              <div className="text-5xl mb-4">⚡</div>
              <div className="text-3xl font-bold text-[#2ec8c6]">Connect</div>
              <div className="text-gray-400 mt-2">Top Repair Shops</div>
            </div>
            <div className="glass rounded-2xl p-6 text-center transform hover:scale-105 transition-transform" style={{ transitionDelay: '200ms' }}>
              <div className="text-5xl mb-4">✅</div>
              <div className="text-3xl font-bold text-[#2ec8c6]">Track</div>
              <div className="text-gray-400 mt-2">Complete History</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

