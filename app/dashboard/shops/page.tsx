'use client';

import { useState } from 'react';

const mockShops = [
  {
    id: 1,
    name: 'Quick Fix Auto',
    rating: 4.8,
    reviews: 127,
    distance: '0.5 mi',
    specialties: ['Oil Change', 'Brakes', 'Engine'],
    priceLevel: '$$',
    verified: true,
    image: '🏪',
  },
  {
    id: 2,
    name: 'Elite Motor Works',
    rating: 4.9,
    reviews: 89,
    distance: '1.2 mi',
    specialties: ['German Cars', 'Diagnostics', 'Transmission'],
    priceLevel: '$$$',
    verified: true,
    image: '🔧',
  },
  {
    id: 3,
    name: 'Honest Joe\'s Garage',
    rating: 4.7,
    reviews: 203,
    distance: '2.1 mi',
    specialties: ['General Repair', 'Tires', 'Alignment'],
    priceLevel: '$',
    verified: true,
    image: '🛠️',
  },
  {
    id: 4,
    name: 'Premium Auto Care',
    rating: 4.6,
    reviews: 156,
    distance: '3.5 mi',
    specialties: ['Luxury Cars', 'Electric Vehicles', 'Detailing'],
    priceLevel: '$$$',
    verified: false,
    image: '✨',
  },
];

export default function ShopsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { value: 'all', label: 'All Shops' },
    { value: 'verified', label: 'Verified Only' },
    { value: 'nearby', label: 'Nearest' },
    { value: 'rating', label: 'Top Rated' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Find Repair Shops</h1>
        <p className="text-gray-400 mt-1">Discover trusted auto repair shops near you</p>
      </div>

      {/* Search & Filters */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, service, or location..."
              className="w-full pl-12 pr-4 py-3 glass rounded-xl bg-transparent border border-gray-700 focus:border-[#2ec8c6] focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedFilter === filter.value
                    ? 'bg-[#2ec8c6] text-black font-semibold'
                    : 'glass hover:bg-white/10'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shops List */}
      <div className="grid md:grid-cols-2 gap-6">
        {mockShops.map((shop) => (
          <div
            key={shop.id}
            className="glass-strong rounded-2xl p-6 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2ec8c6]/20 to-[#1a9a99]/20 rounded-xl flex items-center justify-center text-3xl">
                {shop.image}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{shop.name}</h3>
                  {shop.verified && (
                    <span className="px-2 py-0.5 bg-[#2ec8c6]/20 text-[#2ec8c6] text-xs rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm mb-3">
                  <span className="text-yellow-400">⭐ {shop.rating}</span>
                  <span className="text-gray-400">({shop.reviews} reviews)</span>
                  <span className="text-gray-400">📍 {shop.distance}</span>
                  <span className="text-gray-400">{shop.priceLevel}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {shop.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 glass rounded-full text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex gap-3">
              <button className="flex-1 py-2.5 bg-[#2ec8c6] hover:bg-[#26a5a3] text-black font-semibold rounded-lg transition-colors">
                Request Quote
              </button>
              <button className="px-4 py-2.5 glass rounded-lg hover:bg-white/10 transition-colors">
                📞 Call
              </button>
              <button className="px-4 py-2.5 glass rounded-lg hover:bg-white/10 transition-colors">
                📍 Directions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Map placeholder */}
      <div className="glass-strong rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🗺️</div>
        <h3 className="text-xl font-bold mb-2">Map View Coming Soon</h3>
        <p className="text-gray-400">Interactive map with nearby repair shops</p>
      </div>
    </div>
  );
}

