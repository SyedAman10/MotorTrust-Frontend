'use client';

export default function AISystem() {
  const stats = [
    { label: 'Diagnostic Accuracy', value: '95%' },
    { label: 'Cost Prediction', value: '±10%' },
    { label: 'Problem Detection', value: 'Real-time' },
    { label: 'Data Points', value: '1M+' }
  ];

  return (
    <section id="ai" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <div className="glass-strong rounded-3xl p-12 text-center">
        <div className="text-7xl mb-6">🧠</div>
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="gradient-text">AI-Powered Intelligence</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
          Our advanced AI system analyzes maintenance schedules, repair data, OBD-II codes, 
          and common failure patterns to predict problems and estimate costs with unprecedented accuracy.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass rounded-xl p-6">
              <div className="text-4xl font-bold text-[#2ec8c6] mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

