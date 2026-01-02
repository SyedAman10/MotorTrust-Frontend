'use client';

import { useState } from 'react';

export default function MobileApp() {
  const [activeScreen, setActiveScreen] = useState(0);

  const screenshots = [
    {
      title: 'Vehicle Dashboard',
      description: 'Track all your vehicles in one place',
      placeholder: '📱'
    },
    {
      title: 'AI Diagnostics',
      description: 'Get instant AI-powered diagnosis',
      placeholder: '🤖'
    },
    {
      title: 'Repair Tracking',
      description: 'Monitor repair progress in real-time',
      placeholder: '🔧'
    },
    {
      title: 'Service History',
      description: 'Complete maintenance records',
      placeholder: '📊'
    }
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Take <span className="gradient-text">MotorTrust</span> Everywhere
        </h2>
        <p className="text-xl text-gray-400">
          Download our mobile app and manage your vehicle care on the go
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        {/* Left side - App Screenshots */}
        <div className="relative">
          {/* Main phone mockup */}
          <div className="glass-strong rounded-[3rem] p-4 max-w-sm mx-auto relative">
            {/* Phone notch */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>
            
            {/* Screen */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] overflow-hidden relative aspect-[9/19]">
              {/* Status bar */}
              <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 text-xs text-white z-20">
                <span>9:41</span>
                <div className="flex gap-1">
                  <span>📶</span>
                  <span>📡</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* Content */}
              <div className="pt-12 pb-8 px-6 h-full flex flex-col items-center justify-center">
                <div className="text-8xl mb-6 animate-float">
                  {screenshots[activeScreen].placeholder}
                </div>
                <h3 className="text-2xl font-bold text-[#2ec8c6] mb-3">
                  {screenshots[activeScreen].title}
                </h3>
                <p className="text-gray-400 text-center text-sm">
                  {screenshots[activeScreen].description}
                </p>
              </div>

              {/* Bottom navigation dots */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {screenshots.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveScreen(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activeScreen
                        ? 'bg-[#2ec8c6] w-6'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2ec8c6]/20 to-transparent blur-2xl -z-10"></div>
          </div>

          {/* Floating feature cards */}
          <div className="hidden md:block absolute -left-8 top-1/4 glass rounded-2xl p-4 w-40 animate-float">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-sm font-semibold">Instant Updates</div>
          </div>
          <div className="hidden md:block absolute -right-8 bottom-1/4 glass rounded-2xl p-4 w-40 animate-float" style={{ animationDelay: '1s' }}>
            <div className="text-3xl mb-2">🔔</div>
            <div className="text-sm font-semibold">Smart Alerts</div>
          </div>
        </div>

        {/* Right side - Features & Download */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold">
              Everything you need in your pocket
            </h3>
            
            <div className="space-y-4">
              {[
                {
                  icon: '🚗',
                  title: 'Multi-Vehicle Management',
                  desc: 'Add and track unlimited vehicles'
                },
                {
                  icon: '🤖',
                  title: 'AI-Powered Insights',
                  desc: 'Get smart recommendations instantly'
                },
                {
                  icon: '📸',
                  title: 'Photo Documentation',
                  desc: 'Capture and store repair photos'
                },
                {
                  icon: '🔐',
                  title: 'Secure Cloud Sync',
                  desc: 'All your data backed up automatically'
                }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-4 glass rounded-xl p-4 hover:glass-strong transition-all"
                >
                  <div className="text-3xl">{feature.icon}</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App Store Buttons */}
          <div className="space-y-4 pt-8">
            <p className="text-sm text-gray-400 font-semibold">DOWNLOAD NOW</p>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* App Store Button */}
              <a
                href="#"
                className="glass-strong hover:glow rounded-xl px-6 py-4 flex items-center gap-4 transition-all transform hover:scale-105 group flex-1"
              >
                <div className="text-4xl">🍎</div>
                <div className="text-left">
                  <div className="text-xs text-gray-400">Download on the</div>
                  <div className="text-xl font-bold group-hover:text-[#2ec8c6] transition-colors">
                    App Store
                  </div>
                </div>
              </a>

              {/* Google Play Button */}
              <a
                href="#"
                className="glass-strong hover:glow rounded-xl px-6 py-4 flex items-center gap-4 transition-all transform hover:scale-105 group flex-1"
              >
                <div className="text-4xl">📱</div>
                <div className="text-left">
                  <div className="text-xs text-gray-400">GET IT ON</div>
                  <div className="text-xl font-bold group-hover:text-[#2ec8c6] transition-colors">
                    Google Play
                  </div>
                </div>
              </a>
            </div>

            {/* Additional info */}
            <div className="flex items-center gap-6 text-sm text-gray-500 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-[#2ec8c6]">⭐⭐⭐⭐⭐</span>
                <span>4.8 Rating</span>
              </div>
              <div>•</div>
              <div>100K+ Downloads</div>
              <div>•</div>
              <div>iOS & Android</div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Gallery */}
      <div className="glass-strong rounded-3xl p-8 md:p-12">
        <h3 className="text-3xl font-bold text-center mb-8">App Screenshots</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {screenshots.map((screen, idx) => (
            <button
              key={idx}
              onClick={() => setActiveScreen(idx)}
              className={`glass rounded-2xl p-6 aspect-[9/16] flex flex-col items-center justify-center transition-all transform hover:scale-105 cursor-pointer ${
                idx === activeScreen ? 'glass-strong glow' : ''
              }`}
            >
              <div className="text-6xl mb-4">{screen.placeholder}</div>
              <div className="text-sm font-semibold text-center text-[#2ec8c6]">
                {screen.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* QR Code Section */}
      <div className="mt-16 text-center">
        <div className="glass-strong rounded-3xl p-8 max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="glass rounded-2xl p-6 w-40 h-40 flex items-center justify-center">
              {/* Placeholder QR code */}
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 ${
                      Math.random() > 0.5 ? 'bg-white' : 'bg-[#2ec8c6]'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-left">
              <h4 className="text-2xl font-bold mb-2">Scan to Download</h4>
              <p className="text-gray-400">
                Point your camera at the QR code to download<br />
                MotorTrust on your mobile device
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

