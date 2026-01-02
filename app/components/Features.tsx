'use client';

import { useState } from 'react';

export default function Features() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: '🚗',
      title: 'Vehicle Profile System',
      description: 'Track multiple vehicles with VIN-based profiles, maintenance history, and AI-powered insights.'
    },
    {
      icon: '🤖',
      title: 'AI Diagnostics',
      description: 'Smart diagnosis using OBD-II codes, maintenance schedules, and predictive analytics.'
    },
    {
      icon: '🔧',
      title: 'Repair Shop Network',
      description: 'Connect with verified repair shops, receive quotes, and track service progress in real-time.'
    },
    {
      icon: '📄',
      title: 'Document Storage',
      description: 'Secure cloud storage for all repair invoices, photos, and service documentation.'
    },
    {
      icon: '🛡️',
      title: 'Insurance Integration',
      description: 'Seamless connection with insurance providers for faster claims and verified documentation.'
    },
    {
      icon: '📊',
      title: 'History Sync',
      description: 'Automatic synchronization with CarFax and vehicle history platforms for comprehensive tracking.'
    }
  ];

  return (
    <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Powerful <span className="gradient-text">Features</span>
        </h2>
        <p className="text-xl text-gray-400">Everything you need to manage your vehicle&apos;s lifecycle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredFeature(index)}
            onMouseLeave={() => setHoveredFeature(null)}
            className={`glass rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
              hoveredFeature === index ? 'glass-strong glow' : ''
            }`}
          >
            <div className="text-6xl mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-bold mb-3 text-[#2ec8c6]">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

