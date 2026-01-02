'use client';

export default function Navigation() {
  return (
    <nav className="relative z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2ec8c6] to-[#1a9a99] rounded-lg flex items-center justify-center text-2xl">
            🚗
          </div>
          <span className="text-2xl font-bold gradient-text">MotorTrust</span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="hover:text-[#2ec8c6] transition-colors">Features</a>
          <a href="#users" className="hover:text-[#2ec8c6] transition-colors">For Who</a>
          <a href="#ai" className="hover:text-[#2ec8c6] transition-colors">AI System</a>
        </div>
        <a href="/signup" className="bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-semibold px-6 py-2 rounded-full transition-all transform hover:scale-105 glow inline-block">
          Get Started
        </a>
      </div>
    </nav>
  );
}

