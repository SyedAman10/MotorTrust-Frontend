'use client';

export default function CTA() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <div className="glass-strong rounded-3xl p-12 md:p-20 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-6">
          Ready to <span className="gradient-text">Transform</span>
          <br />Vehicle Care?
        </h2>
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12">
          Join the revolution in automotive service tracking and AI-powered diagnostics.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a href="/signup" className="bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-bold px-12 py-5 rounded-full text-xl transition-all transform hover:scale-105 animate-pulse-glow w-full sm:w-auto text-center">
            Get Started
          </a>
          <button className="glass hover:glass-strong text-white font-bold px-12 py-5 rounded-full text-xl transition-all transform hover:scale-105 w-full sm:w-auto">
            Schedule Demo
          </button>
        </div>
        <div className="mt-12 pt-12 border-t border-gray-800">
          <p className="text-gray-500 mb-4">Launching First in California • Q2 2026</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <span>✓ Privacy First</span>
            <span>✓ Bank-Level Security</span>
            <span>✓ 24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}

