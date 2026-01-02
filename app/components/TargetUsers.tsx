'use client';

export default function TargetUsers() {
  const targetUsers = [
    {
      icon: '👥',
      title: 'Car Owners',
      description: 'Track repairs, manage multiple vehicles, and receive AI recommendations for maintenance.',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: '🏪',
      title: 'Repair Shops',
      description: 'Receive qualified leads, upload documentation, and build trust with transparent service.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🏢',
      title: 'Insurance Companies',
      description: 'Access verified repair data, streamline claims, and reduce fraud with transparent documentation.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '📈',
      title: 'History Services',
      description: 'License accurate, real-time repair data to enhance vehicle history reports.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section id="users" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Built For <span className="gradient-text">Everyone</span>
        </h2>
        <p className="text-xl text-gray-400">A unified ecosystem serving all stakeholders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {targetUsers.map((user, index) => (
          <div
            key={index}
            className="glass-strong rounded-2xl p-8 hover:scale-105 transition-transform cursor-pointer group"
          >
            <div className="flex items-start space-x-6">
              <div className="text-6xl">{user.icon}</div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-3 group-hover:text-[#2ec8c6] transition-colors">
                  {user.title}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">{user.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

