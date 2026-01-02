'use client';

export default function HowItWorks() {
  const steps = [
    { step: '01', title: 'Add Vehicle', desc: 'Enter VIN & details', icon: '🚗' },
    { step: '02', title: 'AI Analysis', desc: 'Get smart insights', icon: '🤖' },
    { step: '03', title: 'Find Shop', desc: 'Connect with experts', icon: '🔧' },
    { step: '04', title: 'Track & Sync', desc: 'Complete transparency', icon: '📊' }
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          How It <span className="gradient-text">Works</span>
        </h2>
        <p className="text-xl text-gray-400">Simple, seamless, and smart</p>
      </div>

      <div className="glass-strong rounded-3xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {steps.map((item, idx) => (
            <div key={idx} className="flex-1 text-center">
              <div className="text-6xl mb-4">{item.icon}</div>
              <div className="text-[#2ec8c6] font-bold text-5xl mb-2">{item.step}</div>
              <div className="text-2xl font-bold mb-2">{item.title}</div>
              <div className="text-gray-400">{item.desc}</div>
              {idx < 3 && (
                <div className="hidden md:block text-[#2ec8c6] text-4xl mt-4">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

